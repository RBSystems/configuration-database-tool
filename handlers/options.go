package handlers

import (
	"fmt"
	"net/http"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/log"
	"github.com/labstack/echo"
)

// GetAllTemplates returns a list of all templates from the database.
func GetAllTemplates(context echo.Context) error {
	log.L.Debugf("%s Starting GetAllTemplates...", optionsTag)

	// get information from the database and return it
	templates, err := db.GetDB().GetAllTemplates()
	if err != nil {
		msg := fmt.Sprintf("failed to get all templates from the database : %s", err.Error())
		log.L.Errorf("%s %s", optionsTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting all templates from the database", optionsTag)
	return context.JSON(http.StatusOK, templates)
}

// GetIcons returns the list of possible icons from the database.
func GetIcons(context echo.Context) error {
	log.L.Debugf("%s Starting GetIcons...", optionsTag)

	// get information from the database and return it
	icons, err := db.GetDB().GetIcons()
	if err != nil {
		msg := fmt.Sprintf("failed to get icons from the database : %s", err.Error())
		log.L.Errorf("%s %s", optionsTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting icons from the database", optionsTag)
	return context.JSON(http.StatusOK, icons)
}

// GetDeviceRoles returns a list of all device roles in the database.
func GetDeviceRoles(context echo.Context) error {
	log.L.Debugf("%s Starting GetDeviceRoles...", optionsTag)

	// get information from the database and return it
	roles, err := db.GetDB().GetDeviceRoles()
	if err != nil {
		msg := fmt.Sprintf("failed to get all device roles from the database : %s", err.Error())
		log.L.Errorf("%s %s", optionsTag, msg)
		return context.JSON(http.StatusInternalServerError, msg)
	}

	log.L.Debugf("%s Finished getting all device roles from the database", optionsTag)
	return context.JSON(http.StatusOK, roles)
}
