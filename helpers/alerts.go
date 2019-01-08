package helpers

import (
	"fmt"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/state/statedefinition"
)

// GetAlertsForAllBuildings return the map of building IDs to their status
func GetAlertsForAllBuildings() (map[string]BuildingStatus, *nerr.E) {
	AllStatuses := make(map[string]BuildingStatus)

	buildings, err := db.GetDB().GetAllBuildings()
	if err != nil {
		msg := "failed to get all buildings from the database"
		return AllStatuses, nerr.Translate(err).Add(msg)
	}

	for _, b := range buildings {
		buildingState, ne := GetStatusOfBuilding(b.ID, true)
		if ne != nil {
			log.L.Warnf("%s failed to get the state of the building %s : %s", AlertsTag, b.ID, ne.String())
		}

		AllStatuses[b.ID] = buildingState
	}

	return AllStatuses, nil
}

// GetStatusOfRoom returns the status of the room with the given ID
func GetStatusOfRoom(roomID string) (RoomStatus, *nerr.E) {
	state := RoomStatus{
		RoomID: roomID,
	}

	deviceStates, err := db.GetDB().GetDeviceStatesByRoom(roomID)
	if err != nil {
		msg := fmt.Sprintf("failed to get the states of the devices in the room %s", roomID)
		return RoomStatus{}, nerr.Translate(err).Add(msg)
	}

	state.DeviceStates = deviceStates

	state.DeviceCount = len(deviceStates)

	tempAlerts := make(map[string]statedefinition.Alert)

	for _, deviceState := range deviceStates {
		for key, value := range deviceState.Alerts {
			tempAlerts[key] = value
		}
		if *deviceState.Alerting {
			state.AlertingDeviceCount++
		}
	}

	state.Alerts = tempAlerts
	state.GoodDeviceCount = state.DeviceCount - state.AlertingDeviceCount

	return state, nil
}

// GetStatusOfBuilding returns the status of the building with the given ID
func GetStatusOfBuilding(buildingID string, verbose bool) (BuildingStatus, *nerr.E) {
	state := BuildingStatus{
		BuildingID: buildingID,
	}

	rooms, err := db.GetDB().GetRoomsByBuilding(buildingID)
	if err != nil {
		msg := fmt.Sprintf("failed to get the rooms in the building %s", buildingID)
		return BuildingStatus{}, nerr.Translate(err).Add(msg)
	}

	tempRoomStates := make(map[string]RoomStatus)

	for _, room := range rooms {
		roomState, ne := GetStatusOfRoom(room.ID)
		if ne != nil {
			log.L.Warnf("%s failed to get the status of the room %s : %s", AlertsTag, room.ID, ne.String())
		}

		if roomState.AlertingDeviceCount > 0 {
			state.AlertingRoomCount++
			tempRoomStates[roomState.RoomID] = roomState
		}

		if verbose {
			tempRoomStates[roomState.RoomID] = roomState
		}

		state.RoomCount++
	}

	if len(tempRoomStates) > 0 {
		state.RoomStates = tempRoomStates
	}

	state.GoodRoomCount = state.RoomCount - state.AlertingRoomCount

	return state, nil
}
