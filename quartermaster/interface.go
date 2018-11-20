package quartermaster

import (
	"log"
	"os"

	"github.com/byuoitav/common/state/statedefinition"
	"github.com/byuoitav/common/structs"
)

//TODO make all endpoints that people want from the cache (regardless of what the underlying database is)
//Also connect the http endpoints
type Cache interface {
	GetDeviceStatusCache() map[string]BuildingState
	GetAllBuildingsStatus() []structs.Building
	GetBuildingStatus(BuildingID string) structs.Building
	GetAllRoomsStatusByBuilding(BuildingID string) map[string]RoomStatus
	GetRoomStatus(RoomID string) RoomStatus
	UpdateRoomStatus(Room RoomStatus) error
	UpdateDeviceStatus(Device statedefinition.StaticDevice) error
}

var address string
var username string
var password string

var cache Cache

func init() {
	address = os.Getenv("DB_ADDRESS")
	username = os.Getenv("DB_USERNAME")
	password = os.Getenv("DB_PASSWORD")

	if len(address) == 0 {
		log.Fatalf("DB_ADDRESS is not set. Can not create a cache. Failing...")
	}
	cache = NewCache(address, username, password)

}

// GetCache returns the instance of the cache to use.
func GetCache() Cache {
	return cache
}
