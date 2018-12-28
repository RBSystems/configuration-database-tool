package helpers

import (
	"fmt"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

// DoDeviceDatabaseAction performs database interactions for devices
func DoDeviceDatabaseAction(device structs.Device, deviceID, username, action string) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: deviceID,
		Action:   action,
		Success:  false,
	}

	// interact with the database
	switch action {
	case AddAction:
		device, err := db.GetDB().CreateDevice(device)
		if err != nil {
			response.Error = fmt.Sprintf("failed to add the device %s to the database", deviceID)
			return response, nerr.Translate(err).Add(response.Error)
		}

		// record the change
		Master.AddedDevices = append(Master.AddedDevices, CreateDeviceChange(device, action, username))

		response.Message = "Device successfully created."
	case UpdateAction:
		device, err := db.GetDB().UpdateDevice(deviceID, device)
		if err != nil {
			response.Error = fmt.Sprintf("failed to update the device %s in the database", deviceID)
			return response, nerr.Translate(err).Add(response.Error)
		}

		// record the change
		Master.UpdatedDevices = append(Master.UpdatedDevices, CreateDeviceChange(device, action, username))

		response.Message = "Device successfully updated."

	case DeleteAction:
		err := db.GetDB().DeleteDevice(deviceID)
		if err != nil {
			response.Error = fmt.Sprintf("failed to delete the device %s from the database", deviceID)
			return response, nerr.Translate(err).Add(response.Error)
		}

		// record the change
		Master.DeletedDevices = append(Master.DeletedDevices, CreateDeviceChange(device, action, username))

		response.Message = "Device successfully deleted."
	}

	// return the response
	response.Success = true
	return response, nil
}

// RecordBulkDeviceChanges takes the responses from calling the CreateBulkDevices database function and makes change records for all of that information
func RecordBulkDeviceChanges(responses []structs.BulkUpdateResponse, username string) []DBResponse {
	var results []DBResponse

	for _, resp := range responses {
		dbRes := DBResponse{
			ObjectID: resp.ID,
			Action:   AddAction,
			Success:  resp.Success,
		}

		if resp.Success {
			dbRes.Message = resp.Message
		} else {
			dbRes.Error = resp.Message
		}

		fakeDevice := structs.Device{ID: resp.ID}

		Master.AddedDevices = append(Master.AddedDevices, CreateDeviceChange(fakeDevice, AddAction, username))

		results = append(results, dbRes)
	}

	return results
}
