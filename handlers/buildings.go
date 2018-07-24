package handlers

import (
	"net/http"

	"github.com/byuoitav/common/auth"
	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

var alert = "This action is not allowed."

// GetBuildings returns a list of all the buildings in the database.
func GetBuildings(context echo.Context) error {

	log.L.Debug("Attempting to get all buildings")
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
	buildings, err := db.GetDB().GetAllBuildings()
	if err != nil {
		log.L.Errorf("Failed to get all buildings : %v", err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debug("Successfully found all buildings")
	return context.JSON(http.StatusOK, buildings)
}

// AddBuilding adds a new building to the database.
func AddBuilding(context echo.Context) error {
	log.L.Debug("Attempting to add a building")
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
	id := context.Param("building")

	log.L.Debugf("Adding the building %s", id)
	var building structs.Building
	context.Bind(&building)
	if building.ID != id && len(building.ID) > 0 {
		log.L.Errorf("Resource address and id don't match.")
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}
	building, err = db.GetDB().CreateBuilding(building)
	if err != nil {
		log.L.Errorf("Failed to add the building %s : %v", id, err.Error())
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debugf("Successfully added %s", id)
	return context.JSON(http.StatusOK, building)
}

// GetBuildingByID returns a specific building based on the given ID.
func GetBuildingByID(context echo.Context) error {
	log.L.Debug("Attempting to get a building")
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
	id := context.Param("building")

	log.L.Debugf("Looking for the building %s", id)
	building, err := db.GetDB().GetBuilding(id)
	if err != nil {
		log.L.Errorf("Failed to get the building %s : %v", id, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("Successfully got %s", id)
	return context.JSON(http.StatusOK, building)
}

// UpdateBuilding updates a building in the database.
func UpdateBuilding(context echo.Context) error {
	log.L.Debug("Attempting to update a building")
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
	id := context.Param("building")

	log.L.Debugf("Updating the building %s", id)
	var building structs.Building
	context.Bind(&building)
	if building.ID != id && len(building.ID) > 0 {
		log.L.Errorf("Resource address and id don't match.")
		return context.JSON(http.StatusBadRequest, "Invalid body. Resource address and id must match")
	}
	building, err = db.GetDB().UpdateBuilding(id, building)
	if err != nil {
		log.L.Errorf("Failed to update the building %s : %v", id, err.Error())
		return context.JSON(http.StatusBadRequest, err.Error())
	}

	log.L.Debugf("Successfully updated %s", id)
	return context.JSON(http.StatusOK, building)
}
