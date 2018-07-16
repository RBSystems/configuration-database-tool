package handlers

import (
	"net/http"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"

	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

//GetRoomsByBuilding returns all the rooms in a building
func GetRoomsByBuilding(context echo.Context) error {
	// ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	// if err != nil {
	// 	return context.JSON(http.StatusInternalServerError, err.Error())
	// }
	// if !ok {
	// 	return context.JSON(http.StatusForbidden, alert)
	// }

	building := context.Param("building")
	rooms, err := db.GetDB().GetRoomsByBuilding(building)
	if err != nil {
		log.L.Errorf("[error] An error occurred: %v", err)
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, rooms)
}

// GetRoomByID returns all info about a room
func GetRoomByID(context echo.Context) error {
	// ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	// if err != nil {
	// 	return context.JSON(http.StatusInternalServerError, err.Error())
	// }
	// if !ok {
	// 	return context.JSON(http.StatusForbidden, alert)
	// }

	id := context.Param("room")

	room, err := db.GetDB().GetRoom(id)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	return context.JSON(http.StatusOK, room)
}

// GetAllRooms returns all rooms from the database.
func GetAllRooms(context echo.Context) error {
	// ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	// if err != nil {
	// 	return context.JSON(http.StatusInternalServerError, err.Error())
	// }
	// if !ok {
	// 	return context.JSON(http.StatusForbidden, alert)
	// }

	rooms, err := db.GetDB().GetAllRooms()
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	return context.JSON(http.StatusOK, rooms)
}

// AddRoom adds a room to the database
func AddRoom(context echo.Context) error {
	// ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
	// if err != nil {
	// 	return context.JSON(http.StatusInternalServerError, err.Error())
	// }
	// if !ok {
	// 	return context.JSON(http.StatusForbidden, alert)
	// }

	var room structs.Room
	err := context.Bind(&room)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Info(room)
	log.L.Info(context.Param("room"))
	log.L.Info(room.ID)
	if context.Param("room") != room.ID {
		return context.JSON(http.StatusBadRequest, "Endpoint and room name must match!")
	}

	room, err = db.GetDB().CreateRoom(room)
	if err != nil {
		log.L.Error(err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, room)
}

// UpdateRoom updates a room in the database.
func UpdateRoom(context echo.Context) error {
	// ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
	// if err != nil {
	// 	return context.JSON(http.StatusInternalServerError, err.Error())
	// }
	// if !ok {
	// 	return context.JSON(http.StatusForbidden, alert)
	// }

	id := context.Param("room")
	var room structs.Room
	context.Bind(&room)
	if room.ID != id && len(room.ID) > 0 {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}
	room, err := db.GetDB().UpdateRoom(id, room)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, room)
}

// GetRoomConfigurations returns a list of all the RoomConfigurations from the database.
func GetRoomConfigurations(context echo.Context) error {
	// ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	// if err != nil {
	// 	return context.JSON(http.StatusInternalServerError, err.Error())
	// }
	// if !ok {
	// 	return context.JSON(http.StatusForbidden, alert)
	// }

	configurations, err := db.GetDB().GetAllRoomConfigurations()
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, configurations)
}

// GetRoomDesignations returns a list of all the RoomDesignations from the database.
func GetRoomDesignations(context echo.Context) error {
	// ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
	// if err != nil {
	// 	return context.JSON(http.StatusInternalServerError, err.Error())
	// }
	// if !ok {
	// 	return context.JSON(http.StatusForbidden, alert)
	// }

	designations, err := db.GetDB().GetRoomDesignations()
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, designations)
}
