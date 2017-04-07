package handlers

import (
	"net/http"

	"github.com/byuoitav/av-api/dbo"
	"github.com/byuoitav/configuration-database-microservice/accessors"
	"github.com/labstack/echo"
)

//GetRoomsByBuilding returns all the rooms in a building
func GetRoomsByBuilding(context echo.Context) error {
	building := context.Param("building")
	rooms, err := dbo.GetRoomsByBuilding(building)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, rooms)
}

// GetRoomByBuildingAndName returns all info about a room
func GetRoomByBuildingAndName(context echo.Context) error {
	building := context.Param("building")
	roomName := context.Param("room")

	room, err := dbo.GetRoomByInfo(building, roomName)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	return context.JSON(http.StatusOK, room)
}

// AddRoom adds a room to the database
func AddRoom(context echo.Context) error {
	var room accessors.Room
	err := context.Bind(&room)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	if context.Param("room") != room.Name {
		return context.JSON(http.StatusBadRequest, "Endpoint and room name must match!")
	}

	room, err = dbo.AddRoom(context.Param("building"), room)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, room)
}
