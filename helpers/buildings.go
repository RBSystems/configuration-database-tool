package helpers

import (
	"fmt"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

// DoBuildingDatabaseAction performs various actions on the database
func DoBuildingDatabaseAction(building structs.Building, buildingID, username, action string) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: buildingID,
		Action:   action,
		Success:  false,
	}

	// interact with the database
	switch action {
	case AddAction:
		_, err := db.GetDB().CreateBuilding(building)
		if err != nil {
			response.Error = fmt.Sprintf("failed to add the building %s to the database", buildingID)
			return response, nerr.Translate(err).Add(response.Error)
		}

		// record the change
		Master.AddedBuildings = append(Master.AddedBuildings, CreateBuildingChange(building, action, username))

		response.Message = "Building successfully created."
	case UpdateAction:
		_, err := db.GetDB().UpdateBuilding(buildingID, building)
		if err != nil {
			response.Error = fmt.Sprintf("failed to update the building %s in the database", buildingID)
			return response, nerr.Translate(err).Add(response.Error)
		}

		// record the change
		Master.UpdatedBuildings = append(Master.UpdatedBuildings, CreateBuildingChange(building, action, username))

		response.Message = "Building successfully updated."

	case DeleteAction:
		err := db.GetDB().DeleteBuilding(buildingID)
		if err != nil {
			response.Error = fmt.Sprintf("failed to delete the building %s from the database", buildingID)
			return response, nerr.Translate(err).Add(response.Error)
		}

		// record the change
		Master.DeletedBuildings = append(Master.DeletedBuildings, CreateBuildingChange(building, action, username))

		response.Message = "Building successfully deleted."
	}

	// return the response
	response.Success = true
	return response, nil
}
