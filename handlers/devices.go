package handlers

import (
	"net/http"

	"github.com/byuoitav/common/auth"
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"

	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

// GetDevicesByRoom returns all of the devices in a room.
func GetDevicesByRoom(context echo.Context) error {
	log.L.Debug("[device] Starting GetDevicesByRoom...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[device] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[device] User %s is not allowed to get all devices in a room.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	roomID := context.Param("room")

	log.L.Debugf("[device] Attempting to get all devices in %s", roomID)

	devices, err := db.GetDB().GetDevicesByRoom(roomID)
	if err != nil {
		log.L.Errorf("[device] An error occurred while getting all devices in the room %s: %v", roomID, err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debugf("[device] Successfully got all devices in the room %s!", roomID)
	return context.JSON(http.StatusOK, devices)
}

// AddDevice adds a device to the database.
func AddDevice(context echo.Context) error {
	log.L.Debug("[device] Starting AddDevice...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
		if err != nil {
			log.L.Errorf("[device] Failed to verify write role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[device] User %s is not allowed to add a device.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	var device structs.Device
	err := context.Bind(&device)
	if err != nil {
		log.L.Debugf("[device] Failed to bind body to a device : %v", err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("[device] Attempting to add the device %s", device.ID)

	device, err = db.GetDB().CreateDevice(device)
	if err != nil {
		log.L.Errorf("[device] An error occurred while adding the device %s : %v", device.ID, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	// Increment the counter on the ServerStatus
	SS.DevicesCreated++

	log.L.Debugf("[device] Successfully added the device %s!", device.ID)
	return context.JSON(http.StatusOK, device)
}

// AddDevicesInBulk adds a list of devices to the database and returns a BulkUpdateResponse.
func AddDevicesInBulk(context echo.Context) error {
	log.L.Debug("[device] Starting AddDevicesInBulk...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
		if err != nil {
			log.L.Errorf("[device] Failed to verify write role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[device] User %s is not allowed to add devices in bulk.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	var devices []structs.Device
	err := context.Bind(&devices)
	if err != nil {
		log.L.Debugf("[device] Failed to bind body to a list of devices : %v", err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("[device] Attempting to add %s devices", len(devices))

	results := db.GetDB().CreateBulkDevices(devices)

	// Update the counter on the ServerStatus
	for _, res := range results {
		if res.Success {
			SS.DevicesCreated++
		}
	}

	log.L.Debugf("[device] Returning responses from trying to add %s devices", len(devices))
	return context.JSON(http.StatusOK, results)
}

// UpdateDevice updates a device's information in the database.
func UpdateDevice(context echo.Context) error {
	log.L.Debug("[device] Starting UpdateDevice...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "write")
		if err != nil {
			log.L.Errorf("[device] Failed to verify write role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[device] User %s is not allowed to update a device.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	id := context.Param("device")
	log.L.Debugf("[device] Attempting to update the device %s", id)

	var device structs.Device
	err := context.Bind(&device)
	if err != nil {
		log.L.Debugf("[device] Failed to bind body to a device : %v", err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}
	if device.ID != id && len(device.ID) > 0 {
		log.L.Error("[device] Invalid body. Param ID: %s - Body ID: %s", id, device.ID)
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}

	device, err = db.GetDB().UpdateDevice(id, device)
	if err != nil {
		log.L.Errorf("[device] An error occurred while updating the device %s : %v", device.ID, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	// Increment the counter on the ServerStatus
	SS.DevicesUpdated++

	log.L.Debugf("[device] Successfully updated the device %s!", device.ID)
	return context.JSON(http.StatusOK, device)
}

// GetDeviceTypes returns a list of all device types in the database.
func GetDeviceTypes(context echo.Context) error {
	log.L.Debug("[device] Starting GetDeviceTypes...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[device] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[device] User %s is not allowed to get all device types.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	log.L.Debug("[device] Attempting to get all device types")

	deviceTypes, err := db.GetDB().GetAllDeviceTypes()
	if err != nil {
		log.L.Errorf("[device] An error occurred while getting device types: %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debug("[device] Successfully got all device types!")
	return context.JSON(http.StatusOK, deviceTypes)
}

// GetDeviceRoles returns a list of all device roles in the database.
func GetDeviceRoles(context echo.Context) error {
	log.L.Debug("[device] Starting GetDeviceRoles...")

	if !Dev {
		ok, err := auth.VerifyRoleForUser(context.Request().Context().Value("user").(string), "read")
		if err != nil {
			log.L.Errorf("[device] Failed to verify read role for %s : %v", context.Request().Context().Value("user").(string), err.Error())
			return context.JSON(http.StatusInternalServerError, err.Error())
		}
		if !ok {
			log.L.Warnf("[device] User %s is not allowed to get all device roles.", context.Request().Context().Value("user").(string))
			return context.JSON(http.StatusForbidden, alert)
		}
	}

	log.L.Debug("[device] Attempting to get all device roles")

	deviceRoles, err := db.GetDB().GetDeviceRoles()
	if err != nil {
		log.L.Errorf("[device] An error occurred while getting device roles: %v", err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debug("[device] Successfully got all device roles!")
	return context.JSON(http.StatusOK, deviceRoles)
}
