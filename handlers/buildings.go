package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"

	"github.com/labstack/echo"
)

// AddBuilding adds a single building to the database.
func AddBuilding(context echo.Context) error {
	log.L.Debugf("%s Starting AddBuilding...", buildingTag)

	var building structs.Building

	// get information from the context
	buildingID := context.Param("building")
	if len(buildingID) < 1 {
		msg := "Invalid building ID in URL"
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	err := context.Bind(&building)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to add the building %s : %s", buildingID, err.Error())
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// check to see if the URL ID and the body building ID match
	if buildingID != building.ID {
		msg := fmt.Sprintf("Mismatched IDs -- URL ID: %s, Body ID: %s", buildingID, building.ID)
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database
	building, err = db.GetDB().CreateBuilding(building)
	if err != nil {
		msg := fmt.Sprintf("failed to add the building %s to the database : %s", buildingID, err.Error())
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished adding the building %s to the database", buildingTag, building.ID)
	return context.JSON(http.StatusOK, nil)
}

// AddBuildings adds multiple buildings to the database.
func AddBuildings(context echo.Context) error {
	log.L.Debugf("%s Starting AddBuildings...", buildingTag)

	var buildings []structs.Building

	// get information from the context
	err := context.Bind(&buildings)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to add multiple buildings : %s", err.Error())
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}
	if len(buildings) < 1 {
		msg := "No buildings were given to add"
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database, record the errors and return them.
	var errors []string

	for _, b := range buildings {
		_, err = db.GetDB().CreateBuilding(b)
		if err != nil {
			msg := fmt.Sprintf("failed to create the building %s during mass creation : %s", b.ID, err.Error())
			log.L.Error("%s %s", buildingTag, msg)
			errors = append(errors, err.Error())
		}
	}

	log.L.Debugf("%s Finished adding the buildings to the database", buildingTag)
	return context.JSON(http.StatusOK, errors)
}

// GetBuilding returns a single building from the database based on the given building ID.
func GetBuilding(context echo.Context) error {
	log.L.Debugf("%s Starting GetBuilding...", buildingTag)

	// get information from the context
	buildingID := context.Param("building")
	if len(buildingID) < 1 {
		msg := "Invalid building ID in URL"
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// get the information from the database and return it
	building, err := db.GetDB().GetBuilding(buildingID)
	if err != nil {
		msg := fmt.Sprintf("failed to get the building %s from the database : %s", buildingID, err.Error())
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debugf("%s Finished getting the building %s from the database", buildingTag, building.ID)
	return context.JSON(http.StatusOK, building)
}

// GetBuildings returns a list of all buildings in the database.
func GetBuildings(context echo.Context) error {
	log.L.Debugf("%s Starting GetBuildings...", buildingTag)

	// get the information from the database and return it
	buildings, err := db.GetDB().GetAllBuildings()
	if err != nil {
		msg := fmt.Sprintf("failed to get all buildings from the database : %s", err.Error())
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting the buildings from the database", buildingTag)
	return context.JSON(http.StatusOK, buildings)
}

// UpdateBuilding updates a single building in the database based on the given building ID.
func UpdateBuilding(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateBuilding...", buildingTag)

	var building structs.Building

	// get information from the context
	buildingID := context.Param("building")
	if len(buildingID) < 1 {
		msg := "Invalid building ID in URL"
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	err := context.Bind(&building)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to update the building %s : %s", buildingID, err.Error())
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database
	building, err = db.GetDB().UpdateBuilding(buildingID, building)
	if err != nil {
		msg := fmt.Sprintf("failed to update the building %s in the database : %s", buildingID, err.Error())
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished updating the building %s in the database", buildingTag, building.ID)
	return context.JSON(http.StatusOK, nil)
}

// UpdateBuildings updates multiple buildings in the database.
func UpdateBuildings(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateBuildings...", buildingTag)

	var buildings []structs.Building

	// get information from the context
	err := context.Bind(&buildings)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to update multiple buildings : %s", err.Error())
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}
	if len(buildings) < 1 {
		msg := "No buildings were given to update"
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database, record the errors and return them.
	var errors []string

	for _, b := range buildings {
		_, err = db.GetDB().UpdateBuilding(b.ID, b)
		if err != nil {
			msg := fmt.Sprintf("failed to update the building %s during mass updating : %s", b.ID, err.Error())
			log.L.Error("%s %s", buildingTag, msg)
			errors = append(errors, err.Error())
		}
	}

	log.L.Debugf("%s Finished updating the buildings in the database", buildingTag)
	return context.JSON(http.StatusOK, errors)
}

// DeleteBuilding deletes a single building from the database based on the given building ID.
func DeleteBuilding(context echo.Context) error {
	log.L.Debugf("%s Starting DeleteBuilding...", buildingTag)

	// get information from the context
	buildingID := context.Param("building")
	if len(buildingID) < 1 {
		msg := "Invalid building ID in URL"
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// delete the information from the database
	err := db.GetDB().DeleteBuilding(buildingID)
	if err != nil {
		msg := fmt.Sprintf("failed to delete the building %s from the database : %s", buildingID, err.Error())
		log.L.Errorf("%s %s", buildingTag, msg)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debugf("%s Finished deleting the building %s from the database", buildingTag, buildingID)
	return context.JSON(http.StatusOK, nil)
}

// DeleteBuildings deletes multiple buildings from the database.
func DeleteBuildings(context echo.Context) error {
	return context.JSON(http.StatusOK, nil)
}
