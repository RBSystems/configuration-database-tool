package handlers

import (
	"net/http"

	"github.com/byuoitav/av-api/dbo"
	"github.com/labstack/echo"
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
