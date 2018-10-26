package quartermaster

import (
	"strings"
	"sync"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/structs"
)

type CouchCache struct {
	address           string
	username          string
	password          string
	deviceStatusCache map[string]BuildingState
	allBuildings      []structs.Building
}

func NewCache(address, username, password string) *CouchCache {
	Cache := CouchCache{
		address:  strings.Trim(address, "/"),
		username: username,
		password: password,
	}
	Cache.FillDeviceStatusCache()
	return &Cache
}

//Returns a map of Building IDs to BuildStatus structs
func (c *CouchCache) getStatusAllBuildings() (map[string]BuildingStatus, error) {
	d := db.GetDB()
	var AllStatuses map[string]BuildingStatus
	AllStatuses = make(map[string]BuildingStatus)
	buildings, err := d.GetAllBuildings()
	if err != nil {
		log.L.Infof("We could not all the Building Statuses: %v", err)
		return AllStatuses, err
	}
	for _, b := range buildings {
		AllStatuses[b.ID], err = c.getStatusBuilding(b.ID)
		if err != nil {
			log.L.Infof("We could not get the device states from the %v: %v", b.ID, err)
		}
	}
	return AllStatuses, nil
}

func (c *CouchCache) getStatusBuilding(ID string) (BuildingStatus, error) {
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
func (c *CouchCache) getStatusAllRoomsByBuilding(BuildingID string) (map[string]RoomStatus, error) {
	d := db.GetDB()
	var AllStatuses map[string]RoomStatus
	AllStatuses = make(map[string]RoomStatus)
	DeviceStates, err := d.GetDeviceStatesByBuilding(BuildingID)
	if err != nil {
		log.L.Infof("We could not get the device states for the rooms in building %v: %v", BuildingID, err)
	}
	for _, deviceState := range DeviceStates {
		if _, exists := AllStatuses[deviceState.Room]; !exists {
			AllStatuses[deviceState.Room], err = c.getStatusRoom(deviceState.Room)
			if err != nil {
				log.L.Infof("We could not get the room status for %v: %v", deviceState.Room, err)
			}
		}
	}
	return AllStatuses, nil
}

//Returns the RoomStatus for the ID Given
func (c *CouchCache) getStatusRoom(ID string) (RoomStatus, error) {
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
func (c *CouchCache) FillDeviceStatusCache() error {
	d := db.GetDB()
	var cacheToFill map[string]BuildingState
	cacheToFill = make(map[string]BuildingState)

	buildings, err := d.GetAllBuildings()
	c.allBuildings = buildings
	if err != nil {
		log.L.Infof("We could not get the building list: %v", err.Error())
		return err
	}
	//For each building, get all the room statuses of that building, get the building status, package it all in a a building state and put that in our map
	for _, b := range buildings {
		buildingStats, err := c.getStatusBuilding(b.ID)
		if err != nil {
			log.L.Infof("Couldn't get the building status for %v: %v", b.ID, err.Error())
			return err
		}
		roomMap, err := c.getStatusAllRoomsByBuilding(b.ID)
		if err != nil {
			log.L.Infof("Couldn't get the room map for %v: %v", b.ID, err.Error())
		}
		buildingState := BuildingState{
			BuildingStats: buildingStats,
			Mutex:         &sync.Mutex{},
			Rooms:         roomMap,
		}
		cacheToFill[b.ID] = buildingState
	}
	c.deviceStatusCache = cacheToFill
	return nil
}

func (c *CouchCache) GetDeviceStatusCache() map[string]BuildingState {
	return c.deviceStatusCache
}

func (c *CouchCache) GetBuildings() []structs.Building {
	return c.allBuildings
}
