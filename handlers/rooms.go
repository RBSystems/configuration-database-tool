package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/byuoitav/common/auth"
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"

	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

//GetRoomsByBuilding returns all the rooms in a room
func GetRoomsByBuilding(context echo.Context) error {
	log.L.Debug("[room] Starting GetRoomsByBuilding...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[room] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[room] User %s is not allowed to get all rooms in a room.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	buildingID := context.Param("building")

	log.L.Debugf("[room] Attempting to get all rooms in %s", buildingID)

	rooms, err := db.GetDB().GetRoomsByBuilding(buildingID)

	if err != nil {
		log.L.Errorf("[room] An error occurred while getting all rooms in the room %s: %v", buildingID, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("[room] Successfully got all rooms in the room %s!", buildingID)
	return context.JSON(http.StatusOK, rooms)
}

// GetRoomByID returns all info about a room
func GetRoomByID(context echo.Context) error {
	log.L.Debug("[room] Starting GetRoomByID...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[room] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[room] User %s is not allowed to get a room by ID.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	id := context.Param("room")

	log.L.Debugf("[room] Attempting to get the room %s", id)

	room, err := db.GetDB().GetRoom(id)
	if err != nil {
		log.L.Errorf("[room] Failed to get the room %s : %v", id, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("[room] Successfully got the room %s!", room.ID)
	return context.JSON(http.StatusOK, room)
}

// GetAllRooms returns all rooms from the database.
func GetAllRooms(context echo.Context) error {
	log.L.Debug("[room] Starting GetAllRooms...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[room] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[room] User %s is not allowed to get all rooms.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	log.L.Debug("[room] Attempting to get all rooms")

	rooms, err := db.GetDB().GetAllRooms()
	if err != nil {
		log.L.Errorf("[room] Failed to get all rooms : %v", err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debug("[room] Successfully got all rooms!")
	return context.JSON(http.StatusOK, rooms)
}

// AddRoom adds a room to the database
func AddRoom(context echo.Context) error {
	log.L.Debug("[room] Starting AddRoom...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
		if err != nil {
			log.L.Errorf("[room] Failed to verify write role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[room] User %s is not allowed to add a room.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	id := context.Param("room")

	log.L.Debugf("[room] Attempting to add the room %s", id)

	var room structs.Room
	err := context.Bind(&room)
	if err != nil {
		log.L.Errorf("[room] Couldn't bind body to a room for %s : %s", id, err.Error())
		return context.JSON(http.StatusBadRequest, fmt.Sprintf("Failed to add the room %s because some information may be missing.", id))
	}

	if id != room.ID {
		log.L.Errorf("[room] Invalid body. Param ID: %s - Body ID: %s", id, room.ID)
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}

	log.L.Debugf("Adding the room %s", room.ID)

	changes.AddNew(context.Request().Context().Value("user").(string), Room, room.ID)

	room, err = db.GetDB().CreateRoom(room)
	if err != nil {
		log.L.Errorf("[room] Failed to add the room %s : %v", id, err.Error())

		if strings.Contains(err.Error(), "already exists") {
			return context.JSON(http.StatusConflict, fmt.Sprintf("Failed to add the room %s because it already exists.", id))
		}

		if strings.Contains(err.Error(), "_id") {
			return context.JSON(http.StatusBadRequest, fmt.Sprintf("Failed to add the room %s because it has an invalid ID.", id))
		}

		if strings.Contains(err.Error(), "name") {
			return context.JSON(http.StatusBadRequest, fmt.Sprintf("Failed to add the room %s because it is missing a name.", id))
		}

		if strings.Contains(err.Error(), "designation") {
			return context.JSON(http.StatusBadRequest, fmt.Sprintf("Failed to add the room %s because it is missing a designation.", id))
		}

		return context.JSON(http.StatusBadRequest, err.Error())
	}

	// Increment the counter on the ServerStatus
	SS.RoomsCreated++

	log.L.Debugf("[room] Successfully added the room %s!", room.ID)
	return context.JSON(http.StatusOK, room)
}

// UpdateRoom updates a room in the database.
func UpdateRoom(context echo.Context) error {
	log.L.Debug("[room] Starting UpdateRoom...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
		if err != nil {
			log.L.Errorf("[room] Failed to verify write role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[room] User %s is not allowed to update a room.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	id := context.Param("room")

	log.L.Debugf("[room] Attempting to update the room %s", id)

	var room structs.Room
	context.Bind(&room)
	if len(room.ID) == 0 {
		log.L.Error("[room] Invalid body. Param ID: %s - Body ID: %s", id, room.ID)
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}

	oldRoom, err := db.GetDB().GetRoom(room.ID)
	if err != nil {
		log.L.Errorf("[room] Room %s does not exist in the database: %v", id, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	changes.AddChange(context.Request().Context().Value("user").(string), Room, FindChanges(oldRoom, room, Room))

	room, err = db.GetDB().UpdateRoom(id, room)
	if err != nil {
		log.L.Errorf("[room] Failed to update the room %s : %v", id, err.Error())

		if strings.Contains(err.Error(), "unable to get") {
			return context.JSON(http.StatusNotFound, fmt.Sprintf("Failed to update the room %s because it does not exist.", id))
		}

		return context.JSON(http.StatusBadRequest, err.Error())
	}

	// Increment the counter on the ServerStatus
	SS.RoomsUpdated++

	log.L.Debugf("[room] Successfully updated the room %s!", room.ID)
	return context.JSON(http.StatusOK, room)
}

// GetRoomConfigurations returns a list of all the RoomConfigurations from the database.
func GetRoomConfigurations(context echo.Context) error {
	log.L.Debug("[room] Starting GetRoomConfigurations...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[room] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[room] User %s is not allowed to get all room configurations.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	log.L.Debug("[room] Attempting to get all room configurations")

	configurations, err := db.GetDB().GetAllRoomConfigurations()
	if err != nil {
		log.L.Errorf("[room] Failed to get all room configurations : %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debug("[room] Successfully got all room configurations!")
	return context.JSON(http.StatusOK, configurations)
}
