package handlers

import (
	"net/http"

	"github.com/byuoitav/av-api/dbo"
	"github.com/labstack/echo"
	"github.com/byuoitav/configuration-database-microservice/accessors"
)

//GetRoomsByBuilding monsters
func GetRoomsByBuilding(context echo.Context) error {
	building := context.Param("building")
	rooms, err := dbo.GetRoomsByBuilding(building)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, rooms)
}

func AddRoom(context echo.Context) error {

	building := context.Param("building")
	var roomToAdd accessors.Room
 	err := context.Bind(roomToAdd)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	room, err := dbo.AddRoom(building, roomToAdd)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	return context.JSON(http.StatusOK, room)
}
