package quartermaster

import (
	"fmt"
	"strings"
	"sync"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/state/statedefinition"
)

func NewCache(address, username, password string) *CouchCache {
	Cache := CouchCache{
		address:  strings.Trim(address, "/"),
		username: username,
		password: password,
	}
	Cache.fillDeviceStatusCache()
	return &Cache
}

//Returns a map of Building IDs to BuildStatus structs
func (c *CouchCache) fetchStatusAllBuildings() (map[string]BuildingStatus, error) {
	d := db.GetDB()
	var AllStatuses map[string]BuildingStatus
	AllStatuses = make(map[string]BuildingStatus)
	buildings, err := d.GetAllBuildings()
	if err != nil {
		log.L.Infof("We could not all the Building Statuses: %v", err)
		return AllStatuses, err
	}
	for _, b := range buildings {
		AllStatuses[b.ID], err = c.fetchStatusBuilding(b.ID)
		if err != nil {
			log.L.Infof("We could not get the device states from the %v: %v", b.ID, err)
		}
	}
	return AllStatuses, nil
}

func (c *CouchCache) fetchStatusBuilding(ID string) (BuildingStatus, error) {
	d := db.GetDB()
	var BuildingReport BuildingStatus
	BuildingReport.BuildingID = ID
	//Get all the Device States for the Building
	DeviceStates, err := d.GetDeviceStatesByBuilding(ID)
	if err != nil {
		log.L.Infof("We could not get the device states for building %v: %v", ID, err)
		return BuildingReport, err
	}
	//Then loop through, counting the rooms, and if
	var roomNames map[string]bool
	roomNames = make(map[string]bool)
	for _, deviceState := range DeviceStates {
		//This will only assign as many elements into the map as there are rooms
		if _, exists := roomNames[deviceState.Room]; !exists {
			roomNames[deviceState.Room] = false
			BuildingReport.RoomCount++
		}
		//If there's an alert, up the alert count
		if *deviceState.Alerting && !roomNames[deviceState.Room] {
			BuildingReport.RoomAlertingCount++
			roomNames[deviceState.Room] = true
		}
	}
	BuildingReport.RoomGoodCount = BuildingReport.RoomCount - BuildingReport.RoomAlertingCount
	return BuildingReport, nil
}

//Returns a map of RoomIds from the specified building to RoomStatuses
func (c *CouchCache) fetchStatusAllRoomsByBuilding(BuildingID string) (map[string]RoomStatus, error) {
	d := db.GetDB()
	var AllStatuses map[string]RoomStatus
	AllStatuses = make(map[string]RoomStatus)
	DeviceStates, err := d.GetDeviceStatesByBuilding(BuildingID)
	if err != nil {
		log.L.Infof("We could not get the device states for the rooms in building %v: %v", BuildingID, err)
	}
	for _, deviceState := range DeviceStates {
		if _, exists := AllStatuses[deviceState.Room]; !exists {
			AllStatuses[deviceState.Room], err = c.fetchStatusRoom(deviceState.Room)
			if err != nil {
				log.L.Infof("We could not get the room status for %v: %v", deviceState.Room, err)
			}
		}
	}
	return AllStatuses, nil
}

//Returns the RoomStatus for the ID Given
func (c *CouchCache) fetchStatusRoom(ID string) (RoomStatus, error) {
	d := db.GetDB()
	var RoomReport RoomStatus
	RoomReport.RoomID = ID
	//Get the Device States from the room
	DeviceStates, err := d.GetDeviceStatesByRoom(ID)
	if err != nil {
		log.L.Infof("We could not get the device states for room %v: %v", ID, err)
		return RoomReport, err
	}
	//Set the DeviceStates to be the Device States received
	RoomReport.DeviceStates = DeviceStates
	//Get Device Count
	RoomReport.DeviceCount = len(DeviceStates)
	//Get Alert Count and Alerts
	alertCount := 0
	var alerts map[string]statedefinition.Alert
	alerts = make(map[string]statedefinition.Alert)
	for _, deviceState := range DeviceStates {
		for key, value := range deviceState.Alerts {
			alerts[key] = value
		}
		if *deviceState.Alerting {
			alertCount += 1
		}
	}
	RoomReport.Alerts = alerts
	RoomReport.DeviceAlertingCount = alertCount
	RoomReport.DeviceGoodCount = RoomReport.DeviceCount - RoomReport.DeviceAlertingCount
	return RoomReport, nil
}

//Fills in the device status cache from the database
func (c *CouchCache) fillDeviceStatusCache() error {
	d := db.GetDB()
	var cacheToFill = make(map[string]BuildingState)

	buildings, err := d.GetAllBuildings()
	if err != nil {
		log.L.Infof("We could not get the building list: %v", err.Error())
		return err
	}
	c.allBuildings = buildings
	//For each building, get all the room statuses of that building, get the building status, package it all in a a building state and put that in our map
	for _, b := range buildings {
		buildingStats, err := c.fetchStatusBuilding(b.ID)
		if err != nil {
			log.L.Infof("Couldn't get the building status for %v: %v", b.ID, err.Error())
			return err
		}
		roomMap, err := c.fetchStatusAllRoomsByBuilding(b.ID)
		if err != nil {
			log.L.Infof("Couldn't get the room map for %v: %v", b.ID, err.Error())
		}
		buildingState := BuildingState{
			BuildingStats: buildingStats,
			Mutex:         &sync.RWMutex{},
			Rooms:         roomMap,
		}
		cacheToFill[b.ID] = buildingState
	}
	c.deviceStatusCache = cacheToFill
	return nil
}

/*
	OUTWARD FACING FUNCTIONS
*/

func (c *CouchCache) GetAllBuildingsStatus() map[string]BuildingState {
	for _, b := range c.allBuildings {
		c.deviceStatusCache[b.ID].Mutex.RLock()
	}
	cacheToReturn := c.deviceStatusCache
	for _, b2 := range c.allBuildings {
		c.deviceStatusCache[b2.ID].Mutex.RUnlock()
	}
	return cacheToReturn
}

func (c *CouchCache) GetBuildingStatus(BuildingID string) BuildingStatus {
	c.deviceStatusCache[BuildingID].Mutex.RLock()
	buildingToReturn := c.deviceStatusCache[BuildingID].BuildingStats
	c.deviceStatusCache[BuildingID].Mutex.RUnlock()
	return buildingToReturn
}

func (c *CouchCache) GetAllRoomsStatusByBuilding(BuildingID string) map[string]RoomStatus {
	c.deviceStatusCache[BuildingID].Mutex.RLock()
	roomsToReturn := c.deviceStatusCache[BuildingID].Rooms
	c.deviceStatusCache[BuildingID].Mutex.RUnlock()
	return roomsToReturn
}

func (c *CouchCache) GetRoomStatus(RoomID string) RoomStatus {
	BuildingID := strings.Split(RoomID, "-")[0]
	c.deviceStatusCache[BuildingID].Mutex.RLock()
	roomToReturn := c.deviceStatusCache[BuildingID].Rooms[RoomID]
	c.deviceStatusCache[BuildingID].Mutex.RUnlock()
	return roomToReturn
}

func (c *CouchCache) UpdateRoomStatus(Room RoomStatus) error {
	//Validate the Room
	if len(Room.RoomID) == 0 {
		log.L.Error("Can't update the cache with an unnamed room")
		return fmt.Errorf("Can't update the cache with an unnamed room")
	}
	//TODO What else needs to be validated?

	BuildingID := strings.Split(Room.RoomID, "-")[0]
	c.deviceStatusCache[BuildingID].Mutex.Lock()
	c.deviceStatusCache[BuildingID].Rooms[Room.RoomID] = Room
	c.deviceStatusCache[BuildingID].Mutex.Unlock()
	return nil
}

func (c *CouchCache) UpdateDeviceStatus(Device statedefinition.StaticDevice) error {
	//Validate the Device
	if len(Device.DeviceID) == 0 {
		log.L.Error("Can't update the cache with an unnamed device")
		return fmt.Errorf("Can't update the cache with an unnamed device")
	}
	//TODO What else needs to be validated?

	BuildingID := strings.Split(Device.DeviceID, "-")[0]
	RoomID := strings.Split(Device.DeviceID, "-")[1]
	c.deviceStatusCache[BuildingID].Mutex.RLock()
	for i, device := range c.deviceStatusCache[BuildingID].Rooms[RoomID].DeviceStates {
		if device.DeviceID == Device.DeviceID {
			c.deviceStatusCache[BuildingID].Mutex.Lock()
			c.deviceStatusCache[BuildingID].Rooms[RoomID].DeviceStates[i] = Device
			c.deviceStatusCache[BuildingID].Mutex.Unlock()
		}
	}
	c.deviceStatusCache[BuildingID].Mutex.RUnlock()
	return nil
}
