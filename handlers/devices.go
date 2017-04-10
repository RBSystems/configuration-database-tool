package handlers

import (
	"net/http"

	"github.com/byuoitav/av-api/dbo"
	"github.com/labstack/echo"
)

func GetDevicesByRoom(context echo.Context) error {
	building := context.Param("building")
	room := context.Param("room")

	devices, err := dbo.GetDevicesByRoom(building, room)
	if err != nil {
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, devices)
}
