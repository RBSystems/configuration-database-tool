package quartermaster

import (
	"sync"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/state/statedefinition"
)

type BuildingState struct {
	BuildStats BuildingStatus
	Mutex      sync.Mutex
	Rooms      map[string]RoomStatus
}

type BuildingStatus struct {
	BuildingID        string
	RoomCount         int
	RoomAlertingCount int
	RoomGoodCount     int
}

type RoomStatus struct {
	RoomID              string
	DeviceCount         int
	DeviceAlertingCount int
	DeviceGoodCount     int
	Alerts              map[string]statedefinition.Alert
	DeviceStates        []statedefinition.StaticDevice
}

//Returns a map of Building IDs to BuildStatus structs
func GetStatusAllBuildings(c db.DB) (map[string]BuildingStatus, error) {
	var AllStatuses map[string]BuildingStatus
	AllStatuses = make(map[string]BuildingStatus)
	buildings, err := c.GetAllBuildings()
	if err != nil {
		log.L.Infof("We could not all the Building Statuses: %v", err)
		return AllStatuses, err
	}
	for _, b := range buildings {
		AllStatuses[b.ID], err = GetStatusBuilding(c, b.ID)
		if err != nil {
			log.L.Infof("We could not get the device states from the %v: %v", b.ID, err)
		}
	}
	return AllStatuses, nil
}

/*
Notes to Me!
Channel Stuff (Not actually that much channel stuff, it's more cache stuff (the cache being mini db 2.0))
1.) Make the Mad Map Structure (The Cache)  Questions: Do I want it to be a singleton (Db)? Is this structure a smart one? How much should be private?
	Key: Building ID --- Value: BUILDING STRUCT{
												Building Stats
												Mutex
												Map --- Key: Room ID --- Value: ROOM STRUCT{
																							Room Stats
																							Device States
																							}
												}
2.) Make sure that the mutex nonsense is correct
3.) Initialize the cache and make sure that it gets all the info from the DB
4.) Change all of the Get functions to redirect to the cache so information will be pulled from there (Technically mutex time, but less complicated)
5.) Write functions to the cache  (Mutex time!)
6.) Update functions to the cache (Moooore Mutex time!)
*/

//Returns a the specified BuildingStatus
func GetStatusBuilding(c db.DB, ID string) (BuildingStatus, error) {
	var BuildingReport BuildingStatus
	BuildingReport.BuildingID = ID
	//Get all the Device States for the Building
	DeviceStates, err := c.GetDeviceStatesByBuilding(ID)
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
func GetStatusAllRoomsByBuilding(c db.DB, BuildingID string) (map[string]RoomStatus, error) {
	var AllStatuses map[string]RoomStatus
	AllStatuses = make(map[string]RoomStatus)
	DeviceStates, err := c.GetDeviceStatesByBuilding(BuildingID)
	if err != nil {
		log.L.Infof("We could not get the device states for the rooms in building %v: %v", BuildingID, err)
	}
	for _, deviceState := range DeviceStates {
		if _, exists := AllStatuses[deviceState.Room]; !exists {
			AllStatuses[deviceState.Room], err = GetStatusRoom(c, deviceState.Room)
			if err != nil {
				log.L.Infof("We could not get the room status for %v: %v", deviceState.Room, err)
			}
		}
	}
	return AllStatuses, nil
}

//Returns the RoomStatus for the ID Given
func GetStatusRoom(c db.DB, ID string) (RoomStatus, error) {
	var RoomReport RoomStatus
	RoomReport.RoomID = ID
	//Get the Device States from the room
	DeviceStates, err := c.GetDeviceStatesByRoom(ID)
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
