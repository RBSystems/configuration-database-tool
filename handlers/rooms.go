package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

// AddRoom adds a room to the database.
func AddRoom(context echo.Context) error {
	log.L.Debugf("%s Starting AddRoom...", roomTag)

	var room structs.Room

	// get information from the context
	roomID := context.Param("room")
	if len(roomID) < 1 {
		msg := "Invalid room ID in URL"
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	err := context.Bind(&room)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to add the room %s : %s", roomID, err.Error())
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// check to see if the URL ID and the body room ID match
	if roomID != room.ID {
		msg := fmt.Sprintf("Mismatched IDs -- URL ID: %s, Body ID: %s", roomID, room.ID)
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database
	room, err = db.GetDB().CreateRoom(room)
	if err != nil {
		msg := fmt.Sprintf("failed to add the room %s to the database : %s", roomID, err.Error())
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished adding the room %s to the database", roomTag, room.ID)
	return context.JSON(http.StatusOK, nil)
}

// AddRooms adds multiple rooms to the database.
func AddRooms(context echo.Context) error {
	log.L.Debugf("%s Starting AddRooms...", roomTag)

	var rooms []structs.Room

	// get information from the context
	err := context.Bind(&rooms)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to add multiple rooms : %s", err.Error())
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}
	if len(rooms) < 1 {
		msg := "No rooms were given to add"
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database, record the errors and return them.
	var errors []string

	for _, r := range rooms {
		_, err = db.GetDB().CreateRoom(r)
		if err != nil {
			msg := fmt.Sprintf("failed to create the room %s during mass creation : %s", r.ID, err.Error())
			log.L.Error("%s %s", roomTag, msg)
			errors = append(errors, err.Error())
		}
	}

	log.L.Debugf("%s Finished adding the rooms to the database", roomTag)
	return context.JSON(http.StatusOK, errors)
}

// GetRoom gets a single room from the database.
func GetRoom(context echo.Context) error {
	log.L.Debugf("%s Starting GetRoom...", roomTag)

	// get information from the context
	roomID := context.Param("room")
	if len(roomID) < 1 {
		msg := "Invalid room ID in URL"
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// get the information from the database and return it
	room, err := db.GetDB().GetRoom(roomID)
	if err != nil {
		msg := fmt.Sprintf("failed to get the room %s from the database : %s", roomID, err.Error())
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debugf("%s Finished getting the room %s from the database", roomTag, room.ID)
	return context.JSON(http.StatusOK, room)
}

// GetRooms gets all rooms from the database.
func GetRooms(context echo.Context) error {
	log.L.Debugf("%s Starting GetRooms...", roomTag)

	// get the information from the database and return it
	rooms, err := db.GetDB().GetAllRooms()
	if err != nil {
		msg := fmt.Sprintf("failed to get all rooms from the database : %s", err.Error())
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting the rooms from the database", roomTag)
	return context.JSON(http.StatusOK, rooms)
}

// GetRoomsByBuilding gets all rooms in a room based on the given room ID.
func GetRoomsByBuilding(context echo.Context) error {
	log.L.Debugf("%s Starting GetRoomsByBuilding...", roomTag)

	// get information from the context
	roomID := context.Param("room")
	if len(roomID) < 1 {
		msg := "Invalid room ID in URL"
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// get the information from the database and return it
	rooms, err := db.GetDB().GetRoomsByBuilding(roomID)
	if err != nil {
		msg := fmt.Sprintf("failed to get all rooms in the room %s from the database : %s", roomID, err.Error())
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting all the rooms in the room %s from the database", roomTag, roomID)
	return context.JSON(http.StatusOK, rooms)
}

// UpdateRoom updates a room in the database.
func UpdateRoom(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateRoom...", roomTag)

	var room structs.Room

	// get information from the context
	roomID := context.Param("room")
	if len(roomID) < 1 {
		msg := "Invalid room ID in URL"
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	err := context.Bind(&room)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to update the room %s : %s", roomID, err.Error())
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database
	room, err = db.GetDB().UpdateRoom(roomID, room)
	if err != nil {
		msg := fmt.Sprintf("failed to update the room %s in the database : %s", roomID, err.Error())
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished updating the room %s in the database", roomTag, room.ID)
	return context.JSON(http.StatusOK, nil)
}

// UpdateRooms updates multiple rooms in the database.
func UpdateRooms(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateRooms...", roomTag)

	var rooms []structs.Room

	// get information from the context
	err := context.Bind(&rooms)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to update multiple rooms : %s", err.Error())
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}
	if len(rooms) < 1 {
		msg := "No rooms were given to update"
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database, record the errors and return them.
	var errors []string

	for _, r := range rooms {
		_, err = db.GetDB().UpdateRoom(r.ID, r)
		if err != nil {
			msg := fmt.Sprintf("failed to update the room %s during mass updating : %s", r.ID, err.Error())
			log.L.Error("%s %s", roomTag, msg)
			errors = append(errors, err.Error())
		}
	}

	log.L.Debugf("%s Finished updating the rooms in the database", roomTag)
	return context.JSON(http.StatusOK, errors)
}

// DeleteRoom deletes a room from the database.
func DeleteRoom(context echo.Context) error {
	log.L.Debugf("%s Starting DeleteRoom...", roomTag)

	// get information from the context
	roomID := context.Param("room")
	if len(roomID) < 1 {
		msg := "Invalid room ID in URL"
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// delete the information from the database
	err := db.GetDB().DeleteRoom(roomID)
	if err != nil {
		msg := fmt.Sprintf("failed to delete the room %s from the database : %s", roomID, err.Error())
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debugf("%s Finished deleting the room %s from the database", roomTag, roomID)
	return context.JSON(http.StatusOK, nil)
}

// DeleteRooms deletes multiple rooms from the database.
func DeleteRooms(context echo.Context) error {
	return context.JSON(http.StatusOK, nil)
}

// GetRoomConfigurations returns a list of all the room configurations listed in the database.
func GetRoomConfigurations(context echo.Context) error {
	log.L.Debugf("%s Starting GetRoomConfigurations...", roomTag)

	// get the information from the database and return it
	configurations, err := db.GetDB().GetAllRoomConfigurations()
	if err != nil {
		msg := fmt.Sprintf("failed to get all configurations from the database : %s", err.Error())
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting the configurations from the database", roomTag)
	return context.JSON(http.StatusOK, configurations)
}

// GetRoomDesignations returns a list of all the RoomDesignations from the database.
func GetRoomDesignations(context echo.Context) error {
	log.L.Debugf("%s Starting GetRoomDesignations...", roomTag)

	// get information from the database and return it
	designations, err := db.GetDB().GetRoomDesignations()
	if err != nil {
		msg := fmt.Sprintf("failed to get all room designations from the database : %s", err.Error())
		log.L.Errorf("%s %s", roomTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting all room designations from the database", roomTag)
	return context.JSON(http.StatusOK, designations)
}
