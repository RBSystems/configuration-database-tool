package handlers

import (
	"net/http"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/nerr"
	"github.com/labstack/echo"
)

func GetAllTemplates(context echo.Context) error {
	templates, err := db.GetDB().GetAllTemplates()
	if err != nil {
		nerr.Translate(err).Add("error calling for dbo to return all templates")
		return context.JSON(http.StatusInternalServerError, err)
	}

	return context.JSON(http.StatusOK, templates)
}
