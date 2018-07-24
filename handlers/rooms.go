package handlers

import (
	"net/http"

	"github.com/byuoitav/common/auth"
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"

	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

//GetRoomsByBuilding returns all the rooms in a room
func GetRoomsByBuilding(context echo.Context) error {
	log.L.Debug("Attemping to get rooms by room")
	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	if err != nil {
		log.L.Errorf("User had an error : %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	if !ok {
		log.L.Errorf("User no good : %v", err.Error())
		return context.JSON(http.StatusForbidden, alert)
	}

	log.L.Debug("User seems ok")

	room := context.Param("room")
	log.L.Debugf("Getting rooms in %s", room)

	rooms, err := db.GetDB().GetRoomsByBuilding(room)
	if err != nil {
		log.L.Errorf("[error] An error occurred: %v", err)
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("Successfully got all rooms in %s", room)
	return context.JSON(http.StatusOK, rooms)
}

// GetRoomByID returns all info about a room
func GetRoomByID(context echo.Context) error {
	log.L.Debug("Attempting to get a room")
	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	if err != nil {
		log.L.Errorf("User had an error : %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	if !ok {
		log.L.Errorf("User no good : %v", err.Error())
		return context.JSON(http.StatusForbidden, alert)
	}

	log.L.Debug("User seems ok")

	id := context.Param("room")

	log.L.Debugf("Looking to get the room %s", id)

	room, err := db.GetDB().GetRoom(id)
	if err != nil {
		log.L.Errorf("Failed to get the room %s : %v", id, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("Successfully got %s", id)
	return context.JSON(http.StatusOK, room)
}

// GetAllRooms returns all rooms from the database.
func GetAllRooms(context echo.Context) error {
	log.L.Debug("Attempting to get all buildings")
	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	if err != nil {
		log.L.Errorf("User had an error : %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	if !ok {
		log.L.Errorf("User no good : %v", err.Error())
		return context.JSON(http.StatusForbidden, alert)
	}

	log.L.Debug("User seems ok")

	rooms, err := db.GetDB().GetAllRooms()
	if err != nil {
		log.L.Errorf("Failed to get all buildings : %v", err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debug("Successfully found all buildings")
	return context.JSON(http.StatusOK, rooms)
}

// AddRoom adds a room to the database
func AddRoom(context echo.Context) error {
	log.L.Debug("Attempting to add a room")
	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
	if err != nil {
		log.L.Errorf("User had an error : %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	if !ok {
		log.L.Errorf("User no good : %v", err.Error())
		return context.JSON(http.StatusForbidden, alert)
	}

	log.L.Debug("User seems ok")

	var room structs.Room
	err = context.Bind(&room)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	if context.Param("room") != room.ID {
		return context.JSON(http.StatusBadRequest, "Endpoint and room name must match!")
	}

	log.L.Debugf("Adding the room %s", room.ID)

	room, err = db.GetDB().CreateRoom(room)
	if err != nil {
		log.L.Error(err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	log.L.Debugf("Successfully added %s", room.ID)
	return context.JSON(http.StatusOK, room)
}

// UpdateRoom updates a room in the database.
func UpdateRoom(context echo.Context) error {
	log.L.Debug("Attempting to update a room")
	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
	if err != nil {
		log.L.Errorf("User had an error : %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	if !ok {
		log.L.Errorf("User no good : %v", err.Error())
		return context.JSON(http.StatusForbidden, alert)
	}

	log.L.Debug("User seems ok")

	id := context.Param("room")
	var room structs.Room
	context.Bind(&room)
	if room.ID != id && len(room.ID) > 0 {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}

	log.L.Debugf("Updating the room %s", id)

	room, err = db.GetDB().UpdateRoom(id, room)
	if err != nil {
		log.L.Errorf("Failed to update the room %s : %v", id, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	log.L.Debugf("Successfully updated %s", id)
	return context.JSON(http.StatusOK, room)
}

// GetRoomConfigurations returns a list of all the RoomConfigurations from the database.
func GetRoomConfigurations(context echo.Context) error {
	log.L.Debug("Attempting to get all room configurations")
	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	if err != nil {
		log.L.Errorf("User had an error : %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	if !ok {
		log.L.Errorf("User no good : %v", err.Error())
		return context.JSON(http.StatusForbidden, alert)
	}

	log.L.Debug("User seems ok")

	configurations, err := db.GetDB().GetAllRoomConfigurations()
	if err != nil {
		log.L.Errorf("[error] An error occurred while getting room configurations: %v", err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debug("Successfully got all room configurations")
	return context.JSON(http.StatusOK, configurations)
}

// GetRoomDesignations returns a list of all the RoomDesignations from the database.
func GetRoomDesignations(context echo.Context) error {
	log.L.Debug("Attempting to get all room designations")
	ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	if err != nil {
		log.L.Errorf("User had an error : %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}
	if !ok {
		log.L.Errorf("User no good : %v", err.Error())
		return context.JSON(http.StatusForbidden, alert)
	}

	log.L.Debug("User seems ok")

	designations, err := db.GetDB().GetRoomDesignations()
	if err != nil {
		log.L.Errorf("[error] An error occurred while getting room designations: %v", err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debug("Successfully got all room designations")
	return context.JSON(http.StatusOK, designations)
}
