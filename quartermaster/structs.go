package quartermaster

import (
	"sync"

	"github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/structs"
)

type BuildingState struct {
	BuildingStats BuildingStatus
	Mutex         *sync.RWMutex
	Rooms         map[string]RoomStatus
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

type CouchCache struct {
	address           string
	username          string
	password          string
	deviceStatusCache map[string]BuildingState
	allBuildings      []structs.Building
}
