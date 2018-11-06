package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/byuoitav/av-api/base"
	"github.com/byuoitav/common/log"
	"github.com/byuoitav/common/v2/auth"
	"github.com/labstack/echo"
)

// SetRoomState calls out to an API to set the state of a room on campus.
func SetRoomState(context echo.Context) error {
	building := context.Param("building")
	room := context.Param("room")

	var state *base.PublicRoom

	err := context.Bind(&state)
	if err != nil {
		log.L.Errorf("failed to bind body of request : %s", err.Error())
		return context.JSON(http.StatusBadRequest, err)
	}

	s, err := json.Marshal(state)
	if err != nil {
		log.L.Errorf("failed to marshal request body : %s", err.Error())
		return context.JSON(http.StatusBadRequest, err)
	}

	url := fmt.Sprintf("http://%s/buildings/%s/rooms/%s", os.Getenv("AV_API_ADDRESS"), building, room)

	req, err := http.NewRequest("PUT", url, bytes.NewReader(s))

	auth.AddAuthToRequest(req)

	client := http.Client{}
	resp, err := client.Do(req)

	var body *base.PublicRoom
	b, err := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal(b, &body)
	if err != nil {
		log.L.Errorf("failed to unmarshal response : %s", err.Error())
		return context.JSON(http.StatusInternalServerError, err)
	}

	return context.JSON(http.StatusOK, body)
}

// GetRoomState calls out to an API to get the state of a room on campus.
func GetRoomState(context echo.Context) error {
	building := context.Param("building")
	room := context.Param("room")

	url := fmt.Sprintf("http://%s/buildings/%s/rooms/%s", os.Getenv("AV_API_ADDRESS"), building, room)

	req, err := http.NewRequest("GET", url, nil)

	auth.AddAuthToRequest(req)

	client := http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.L.Errorf("failed to send get request : %s", err.Error())
	}

	var body *base.PublicRoom
	b, err := ioutil.ReadAll(resp.Body)
	err = json.Unmarshal(b, &body)
	if err != nil {
		log.L.Errorf("failed to unmarshal response : %s", err.Error())
		return context.JSON(http.StatusInternalServerError, err)
	}

	return context.JSON(http.StatusOK, body)
}
