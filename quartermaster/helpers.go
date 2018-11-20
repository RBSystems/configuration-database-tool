package quartermaster

import (
	"strings"
)

/*
Notes to Me!
Channel Stuff (Not actually that much channel stuff, it's more cache stuff (the cache being mini db 2.0))
DONE 1b.) Talk to Joe and make sure that we need an interfacey thing (cuz it seems like I'm trying unnecessarily hard to understand it, and I don't get it
DONE 2.) Make sure that the mutex nonsense is correct
DONE 3.) Initialize the cache and make sure that it gets all the info from the DB

4.) Change all of the Get functions to redirect to the cache so information will be pulled from there (Technically mutex time, but less complicated)
5.) Write functions to the cache  (Mutex time!)
6.) Update functions to the cache (Moooore Mutex time!)
*/

func GetStatusAllBuildings() (map[string]BuildingStatus, error) {
	c := GetCache()
	deviceStatusCache := c.GetDeviceStatusCache() //Get the device states cache
	//var AllBuildingStatus map[string]BuildingStatus
	AllBuildingStatus := make(map[string]BuildingStatus)
	for k, v := range deviceStatusCache {
		//Each key is the building name and the value is a BuildingState.
		//BuildingState.BuildingStats is the BuildingStatus of a particular building
		AllBuildingStatus[k] = v.BuildingStats
	}
	return AllBuildingStatus, nil
}

//Access the cache and get one building status
func GetStatusBuilding(buildingID string) (BuildingStatus, error) {
	c := GetCache()
	deviceStatusCache := c.GetDeviceStatusCache()
	return deviceStatusCache[buildingID].BuildingStats, nil
}

func GetStatusAllRoomsByBuilding(buildingID string) (map[string]RoomStatus, error) {
	c := GetCache()
	deviceStatusCache := c.GetDeviceStatusCache()
	return deviceStatusCache[buildingID].Rooms, nil
}

func GetStatusRoom(roomID string) (RoomStatus, error) {
	c := GetCache()
	deviceStatusCache := c.GetDeviceStatusCache()
	buildingID := strings.Split(roomID, "-")[0]
	return deviceStatusCache[buildingID].Rooms[roomID], nil
}
