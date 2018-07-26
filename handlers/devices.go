package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/common/auth"
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"

	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

// GetDevicesByRoom returns all of the devices in a room.
func GetDevicesByRoom(context echo.Context) error {
	log.L.Debug("Attemping to get devices by room")

	if !Dev {
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
	}

	roomID := context.Param("room")

	log.L.Debugf("Getting devices in %s", roomID)
	devices, err := db.GetDB().GetDevicesByRoom(roomID)
	if err != nil {
		log.L.Errorf("[error] An error occurred while getting devices in room %s: %v", roomID, err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debugf("Successfully got all devices in %s", roomID)
	return context.JSON(http.StatusOK, devices)
}

// AddDevice adds a device to the database.
func AddDevice(context echo.Context) error {
	log.L.Debug("Attemping to add a device")

	if !Dev {
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
	}

	var device structs.Device
	err := context.Bind(&device)
	if err != nil {
		log.L.Info(err)
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("Adding %s...", device.ID)

	device, err = db.GetDB().CreateDevice(device)
	if err != nil {
		log.L.Info(err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("Successfully added %s", device.ID)
	return context.JSON(http.StatusOK, device)
}

// AddDevicesInBulk adds a list of devices to the database and returns a BulkUpdateResponse.
func AddDevicesInBulk(context echo.Context) error {
	log.L.Debug("Attemping to add a bulk amount of devices")

	if !Dev {
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
	}

	var devices []structs.Device
	err := context.Bind(&devices)
	if err != nil {
		log.L.Error(err)
		return context.JSON(http.StatusBadRequest, fmt.Sprintf("Invalid body. Failed to bind to a device list : %s", err.Error()))
	}

	log.L.Debugf("Adding %s devices...", len(devices))

	results := db.GetDB().CreateBulkDevices(devices)

	log.L.Debugf("Successfully added %s devices", len(devices))
	return context.JSON(http.StatusOK, results)
}

// UpdateDevice updates a device's information in the database.
func UpdateDevice(context echo.Context) error {
	log.L.Debug("Attemping to update a device")

	if !Dev {
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
	}

	id := context.Param("device")
	var device structs.Device

	err := context.Bind(&device)
	if err != nil {
		log.L.Error(err)
		return context.JSON(http.StatusBadRequest, fmt.Sprintf("Invalid body. Failed to bind to a device : %s", err.Error()))
	}
	if device.ID != id && len(device.ID) > 0 {
		log.L.Errorf("Resource address and id don't match.")
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}

	log.L.Debugf("Updating %s...", device.ID)

	device, err = db.GetDB().UpdateDevice(id, device)
	if err != nil {
		log.L.Error(err)
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("Successfully updated %s", device.ID)
	return context.JSON(http.StatusOK, device)
}

// GetDeviceTypes returns a list of all device types in the database.
func GetDeviceTypes(context echo.Context) error {
	log.L.Debug("Attempting to get all device types")

	if !Dev {
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
	}

	deviceTypes, err := db.GetDB().GetAllDeviceTypes()
	if err != nil {
		log.L.Errorf("[error] An error occurred while getting device types: %v", err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debug("Successfully got all device types")
	return context.JSON(http.StatusOK, deviceTypes)
}

// GetDeviceRoles returns a list of all device roles in the database.
func GetDeviceRoles(context echo.Context) error {
	log.L.Debug("Attempting to get all device roles")

	if !Dev {
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
	}

	deviceRoles, err := db.GetDB().GetDeviceRoles()
	if err != nil {
		log.L.Errorf("[error] An error occurred while getting device roles: %v", err)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debug("Successfully got all device roles")
	return context.JSON(http.StatusOK, deviceRoles)
}
