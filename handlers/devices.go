package handlers

import (
	"net/http"

	"github.com/byuoitav/av-api/dbo"
	"github.com/byuoitav/configuration-database-microservice/structs"
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

func AddDevice(context echo.Context) error {
	var device structs.Device
	err := context.Bind(&device)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	if context.Param("device") != device.Name {
		return context.JSON(http.StatusBadRequest, "Endpoint and device name must match!")
	}

	device.Building.Shortname = context.Param("building")
	device.Room.Name = context.Param("room")

	device, err = dbo.AddDevice(device)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	return context.JSON(http.StatusOK, device)
}

func SetDeviceAttribute(context echo.Context) error {
	var info structs.DeviceAttributeInfo

	err := context.Bind(&info)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	device, err := dbo.SetDeviceAttribute(info)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	return context.JSON(http.StatusOK, device)

}
