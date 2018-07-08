package handlers

import (
	"net/http"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"

	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

// GetDevicesByRoom returns all of the devices in a room.
func GetDevicesByRoom(context echo.Context) error {
	roomID := context.Param("room")

	devices, err := db.GetDB().GetDevicesByRoom(roomID)
	if err != nil {
		log.L.Errorf("[error] An error occurred while getting devices in room %s: %v", roomID, err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, devices)
}

// AddDevice adds a device to the database.
func AddDevice(context echo.Context) error {
	var device structs.Device
	err := context.Bind(&device)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	device, err = db.GetDB().CreateDevice(device)
	if err != nil {
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	return context.JSON(http.StatusOK, device)
}

// UpdateDevice updates a device's information in the database.
func UpdateDevice(context echo.Context) error {
	id := context.Param("device")
	var device structs.Device

	context.Bind(&device)
	if device.ID != id && len(device.ID) > 0 {
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}

	device, err := db.GetDB().UpdateDevice(id, device)
	if err != nil {
		log.L.Error(err)
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	return context.JSON(http.StatusOK, device)
}

// GetDeviceTypes returns a list of all device types in the database.
func GetDeviceTypes(context echo.Context) error {
	deviceTypes, err := db.GetDB().GetAllDeviceTypes()
	if err != nil {
		log.L.Errorf("[error] An error occurred while getting device types: %v", err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, deviceTypes)
}

// GetDeviceRoles returns a list of all device roles in the database.
func GetDeviceRoles(context echo.Context) error {
	deviceRoles, err := db.GetDB().GetDeviceRoles()
	if err != nil {
		log.L.Errorf("[error] An error occurred while getting device roles: %v", err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	return context.JSON(http.StatusOK, deviceRoles)
}
