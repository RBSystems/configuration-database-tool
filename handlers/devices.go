package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"

	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

// AddDevice adds a single device to the database.
func AddDevice(context echo.Context) error {
	log.L.Debugf("%s Starting AddDevice...", deviceTag)

	var device structs.Device

	// get information from the context
	deviceID := context.Param("device")
	if len(deviceID) < 1 {
		msg := "Invalid device ID in URL"
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	err := context.Bind(&device)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to add the device %s : %s", deviceID, err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// check to see if the URL ID and the body device ID match
	if deviceID != device.ID {
		msg := fmt.Sprintf("Mismatched IDs -- URL ID: %s, Body ID: %s", deviceID, device.ID)
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database
	device, err = db.GetDB().CreateDevice(device)
	if err != nil {
		msg := fmt.Sprintf("failed to add the device %s to the database : %s", deviceID, err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished adding the device %s to the database", deviceTag, device.ID)
	return context.JSON(http.StatusOK, nil)
}

// AddDevices adds multiple devices to the database.
func AddDevices(context echo.Context) error {
	log.L.Debugf("%s Starting AddDevices...", deviceTag)

	var devices []structs.Device

	// get information from the context
	err := context.Bind(&devices)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to add multiple devices : %s", err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}
	if len(devices) < 1 {
		msg := "No devices were given to add"
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database, record the errors and return them.
	results := db.GetDB().CreateBulkDevices(devices)

	log.L.Debugf("%s Finished adding the devices to the database", deviceTag)
	return context.JSON(http.StatusOK, results)
}

// GetDevice returns a single device from the database based on the given device ID.
func GetDevice(context echo.Context) error {
	log.L.Debugf("%s Starting GetDevice...", deviceTag)

	// get information from the context
	deviceID := context.Param("device")
	if len(deviceID) < 1 {
		msg := "Invalid device ID in URL"
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// get the information from the database and return it
	device, err := db.GetDB().GetDevice(deviceID)
	if err != nil {
		msg := fmt.Sprintf("failed to get the device %s from the database : %s", deviceID, err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debugf("%s Finished getting the device %s from the database", deviceTag, device.ID)
	return context.JSON(http.StatusOK, device)
}

// GetDevices returns a list of all devices in the database.
func GetDevices(context echo.Context) error {
	log.L.Debugf("%s Starting GetDevices...", deviceTag)

	// get the information from the database and return it
	devices, err := db.GetDB().GetAllDevices()
	if err != nil {
		msg := fmt.Sprintf("failed to get all devices from the database : %s", err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting the devices from the database", deviceTag)
	return context.JSON(http.StatusOK, devices)
}

// UpdateDevice updates a single device in the database based on the given device ID.
func UpdateDevice(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateDevice...", deviceTag)

	var device structs.Device

	// get information from the context
	deviceID := context.Param("device")
	if len(deviceID) < 1 {
		msg := "Invalid device ID in URL"
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	err := context.Bind(&device)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to update the device %s : %s", deviceID, err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database
	device, err = db.GetDB().UpdateDevice(deviceID, device)
	if err != nil {
		msg := fmt.Sprintf("failed to update the device %s in the database : %s", deviceID, err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished updating the device %s in the database", deviceTag, device.ID)
	return context.JSON(http.StatusOK, nil)
}

// UpdateDevices updates multiple devices in the database.
func UpdateDevices(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateDevices...", deviceTag)

	var devices []structs.Device

	// get information from the context
	err := context.Bind(&devices)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to update multiple devices : %s", err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}
	if len(devices) < 1 {
		msg := "No devices were given to update"
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database, record the errors and return them.
	var errors []string

	for _, d := range devices {
		_, err = db.GetDB().UpdateDevice(d.ID, d)
		if err != nil {
			msg := fmt.Sprintf("failed to update the device %s during mass updating : %s", d.ID, err.Error())
			log.L.Error("%s %s", deviceTag, msg)
			errors = append(errors, err.Error())
		}
	}

	log.L.Debugf("%s Finished updating the devices in the database", deviceTag)
	return context.JSON(http.StatusOK, errors)
}

// DeleteDevice deletes a single device from the database based on the given device ID.
func DeleteDevice(context echo.Context) error {
	log.L.Debugf("%s Starting DeleteDevice...", deviceTag)

	// get information from the context
	deviceID := context.Param("device")
	if len(deviceID) < 1 {
		msg := "Invalid device ID in URL"
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// delete the information from the database
	err := db.GetDB().DeleteDevice(deviceID)
	if err != nil {
		msg := fmt.Sprintf("failed to delete the device %s from the database : %s", deviceID, err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debugf("%s Finished deleting the device %s from the database", deviceTag, deviceID)
	return context.JSON(http.StatusOK, nil)
}

// DeleteDevices deletes multiple devices from the database.
func DeleteDevices(context echo.Context) error {
	return context.JSON(http.StatusOK, nil)
}

// GetDevicesByRoom returns a list of all devices in a single room.
func GetDevicesByRoom(context echo.Context) error {
	log.L.Debugf("%s Starting GetDevicesByRoom...", deviceTag)

	// get information from the context
	roomID := context.Param("room")
	if len(roomID) < 1 {
		msg := "Invalid room ID in URL"
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// get the information from the database and return it
	devices, err := db.GetDB().GetDevicesByRoom(roomID)
	if err != nil {
		msg := fmt.Sprintf("failed to get all devices in %s from the database : %s", roomID, err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting the devices in %s from the database", deviceTag, roomID)
	return context.JSON(http.StatusOK, devices)
}

// GetDevicesByRoomAndRole returns a list of all devices in a room that have the given role.
func GetDevicesByRoomAndRole(context echo.Context) error {
	log.L.Debugf("%s Starting GetDevicesByRoomAndRole...", deviceTag)

	// get information from the context
	roomID := context.Param("room")
	if len(roomID) < 1 {
		msg := "Invalid room ID in URL"
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	role := context.Param("role")
	if len(role) < 1 {
		msg := "Invalid role ID in URL"
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// get the information from the database and return it
	devices, err := db.GetDB().GetDevicesByRoomAndRole(roomID, role)
	if err != nil {
		msg := fmt.Sprintf("failed to get all devices in %s with the role %s from the database : %s", roomID, role, err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting the devices in %s with the role %s from the database", deviceTag, roomID, role)
	return context.JSON(http.StatusOK, devices)
}

// GetDevicesByRoleAndType returns a list of all devices that have a given role and type.
func GetDevicesByRoleAndType(context echo.Context) error {
	log.L.Debugf("%s Starting GetDevicesByRoleAndType...", deviceTag)

	// get information from the context
	role := context.Param("role")
	if len(role) < 1 {
		msg := "Invalid role ID in URL"
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	typeID := context.Param("type")
	if len(typeID) < 1 {
		msg := "Invalid type ID in URL"
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// get the information from the database and return it
	devices, err := db.GetDB().GetDevicesByRoleAndType(role, typeID)
	if err != nil {
		msg := fmt.Sprintf("failed to get all devices of type %s with the role %s from the database : %s", typeID, role, err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting the devices of type %s with the role %s from the database", deviceTag, typeID, role)
	return context.JSON(http.StatusOK, devices)
}

// GetDeviceTypes returns a list of all device types in the database.
func GetDeviceTypes(context echo.Context) error {
	log.L.Debugf("%s Starting GetDeviceTypes...", deviceTag)

	// get the information from the database and return it
	deviceTypes, err := db.GetDB().GetAllDeviceTypes()
	if err != nil {
		msg := fmt.Sprintf("failed to get all device types from the database : %s", err.Error())
		log.L.Errorf("%s %s", deviceTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting all device types from the database", deviceTag)
	return context.JSON(http.StatusOK, deviceTypes)
}
