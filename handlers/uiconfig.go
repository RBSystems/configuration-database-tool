package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/structs"
	"github.com/labstack/echo"
)

// AddUIConfig adds a single UI configuration to the database.
func AddUIConfig(context echo.Context) error {
	log.L.Debugf("%s Starting AddUIConfig...", configTag)

	var uiconfig structs.UIConfig

	// get information from the context
	roomID := context.Param("room")
	if len(roomID) < 1 {
		msg := "Invalid room ID in URL"
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	err := context.Bind(&uiconfig)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to add the UI configuration for %s : %s", roomID, err.Error())
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// check to see if the URL ID and the body UI configuration ID match
	if roomID != uiconfig.ID {
		msg := fmt.Sprintf("Mismatched IDs -- URL ID: %s, Body ID: %s", roomID, uiconfig.ID)
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database
	uiconfig, err = db.GetDB().CreateUIConfig(uiconfig.ID, uiconfig)
	if err != nil {
		msg := fmt.Sprintf("failed to add the UI configuration for %s to the database : %s", roomID, err.Error())
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished adding the UI configuration for %s to the database", configTag, uiconfig.ID)
	return context.JSON(http.StatusOK, nil)
}

// AddUIConfigs adds multiple configs to the database.
func AddUIConfigs(context echo.Context) error {
	log.L.Debugf("%s Starting AddUIConfigs...", configTag)

	var configs []structs.UIConfig

	// get information from the context
	err := context.Bind(&configs)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to add multiple configs : %s", err.Error())
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}
	if len(configs) < 1 {
		msg := "No configs were given to add"
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database, record the errors and return them.
	var errors []string

	for _, u := range configs {
		_, err = db.GetDB().CreateUIConfig(u.ID, u)
		if err != nil {
			msg := fmt.Sprintf("failed to create the UI configuration for %s during mass creation : %s", u.ID, err.Error())
			log.L.Error("%s %s", configTag, msg)
			errors = append(errors, err.Error())
		}
	}

	log.L.Debugf("%s Finished adding the configs to the database", configTag)
	return context.JSON(http.StatusOK, errors)
}

// GetUIConfig returns a single UI configuration from the database based on the given room ID.
func GetUIConfig(context echo.Context) error {
	log.L.Debugf("%s Starting GetUIConfig...", configTag)

	// get information from the context
	roomID := context.Param("room")
	if len(roomID) < 1 {
		msg := "Invalid room ID in URL"
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// get the information from the database and return it
	uiconfig, err := db.GetDB().GetUIConfig(roomID)
	if err != nil {
		msg := fmt.Sprintf("failed to get the UI configuration for %s from the database : %s", roomID, err.Error())
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debugf("%s Finished getting the UI configuration for %s from the database", configTag, uiconfig.ID)
	return context.JSON(http.StatusOK, uiconfig)
}

// GetUIConfigs returns a list of all configs in the database.
func GetUIConfigs(context echo.Context) error {
	log.L.Debugf("%s Starting GetUIConfigs...", configTag)

	// get the information from the database and return it
	configs, err := db.GetDB().GetAllUIConfigs()
	if err != nil {
		msg := fmt.Sprintf("failed to get all configs from the database : %s", err.Error())
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting the configs from the database", configTag)
	return context.JSON(http.StatusOK, configs)
}

// UpdateUIConfig updates a single UI configuration in the database based on the given room ID.
func UpdateUIConfig(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateUIConfig...", configTag)

	var uiconfig structs.UIConfig

	// get information from the context
	roomID := context.Param("room")
	if len(roomID) < 1 {
		msg := "Invalid room ID in URL"
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	err := context.Bind(&uiconfig)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to update the UI configuration for %s : %s", roomID, err.Error())
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database
	uiconfig, err = db.GetDB().UpdateUIConfig(roomID, uiconfig)
	if err != nil {
		msg := fmt.Sprintf("failed to update the UI configuration for %s in the database : %s", roomID, err.Error())
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished updating the UI configuration for %s in the database", configTag, uiconfig.ID)
	return context.JSON(http.StatusOK, nil)
}

// UpdateUIConfigs updates multiple configs in the database.
func UpdateUIConfigs(context echo.Context) error {
	log.L.Debugf("%s Starting UpdateUIConfigs...", configTag)

	var configs []structs.UIConfig

	// get information from the context
	err := context.Bind(&configs)
	if err != nil {
		msg := fmt.Sprintf("failed to bind body from request to update multiple configs : %s", err.Error())
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}
	if len(configs) < 1 {
		msg := "No configs were given to update"
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// send the body to the database, record the errors and return them.
	var errors []string

	for _, u := range configs {
		_, err = db.GetDB().UpdateUIConfig(u.ID, u)
		if err != nil {
			msg := fmt.Sprintf("failed to update the UI configuration for %s during mass updating : %s", u.ID, err.Error())
			log.L.Error("%s %s", configTag, msg)
			errors = append(errors, err.Error())
		}
	}

	log.L.Debugf("%s Finished updating the configs in the database", configTag)
	return context.JSON(http.StatusOK, errors)
}

// DeleteUIConfig deletes a single UI configuration from the database based on the given room ID.
func DeleteUIConfig(context echo.Context) error {
	log.L.Debugf("%s Starting DeleteUIConfig...", configTag)

	// get information from the context
	roomID := context.Param("room")
	if len(roomID) < 1 {
		msg := "Invalid room ID in URL"
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusBadRequest, msg)
	}

	// delete the information from the database
	err := db.GetDB().DeleteUIConfig(roomID)
	if err != nil {
		msg := fmt.Sprintf("failed to delete the UI configuration for %s from the database : %s", roomID, err.Error())
		log.L.Errorf("%s %s", configTag, msg)
		return context.JSON(http.StatusInternalServerError, err.Error())
	}

	log.L.Debugf("%s Finished deleting the UI configuration for %s from the database", configTag, roomID)
	return context.JSON(http.StatusOK, nil)
}

// DeleteUIConfigs deletes multiple configs from the database.
func DeleteUIConfigs(context echo.Context) error {
	return context.JSON(http.StatusOK, nil)
}
