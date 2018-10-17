package quartermaster

import (
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/state/statedefinition"
)

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

/*
	Returns (# of Rooms, # of Rooms alerting) for each building
*/
func GetStatusAllBuildings(c db.DB) ([]BuildingStatus, error) {
	var AllStatuses []BuildingStatus
	buildings, err := c.GetAllBuildings()
	if err != nil {
		log.L.Infof("We could not all the Building Statuses: %v", err)
		return AllStatuses, err
	}
	for _, b := range buildings {
		curr_b, err := GetStatusBuilding(c, b.ID)
		AllStatuses = append(AllStatuses, curr_b)
		if err != nil {
			log.L.Infof("We could not get the device states from the %v: %v", b.ID, err)
		}
	}
	return AllStatuses, err
}

/*
Notes to Me!
4.) Ask Joe if I'm missing anything before we work on channel stuff
4B.) Do that Stuff
5.) Channel Stuff
*/

//Returns # of Rooms, # of Rooms alerting)
func GetStatusBuilding(c db.DB, ID string) (BuildingStatus, error) {
	var BuildingReport BuildingStatus
	BuildingReport.BuildingID = ID
	//Get all the Device States for the Building
	DeviceStates, err := c.GetDeviceStatesByBuilding(ID)
	if err != nil {
		log.L.Infof("We could not get the device states for building %v: %v", ID, err)
		return BuildingReport, err
	}
	//Then loop through, countint the rooms, and if
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

//Returns # Devices, # of Devices Alerting, #Alerts, All Device States
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
