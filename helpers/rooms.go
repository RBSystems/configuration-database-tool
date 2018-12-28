package helpers

import (
	"fmt"

	"github.com/byuoitav/common/db"
	"github.com/byuoitav/common/nerr"
	"github.com/byuoitav/common/structs"
)

// DoRoomDatabaseAction performs database interactions for rooms
func DoRoomDatabaseAction(room structs.Room, roomID, username, action string) (DBResponse, *nerr.E) {
	// build response object
	response := DBResponse{
		ObjectID: roomID,
		Action:   action,
		Success:  false,
	}

	// interact with the database
	switch action {
	case AddAction:
		room, err := db.GetDB().CreateRoom(room)
		if err != nil {
			response.Error = fmt.Sprintf("failed to add the room %s to the database", roomID)
			return response, nerr.Translate(err).Add(response.Error)
		}

		// record the change
		Master.AddedRooms = append(Master.AddedRooms, CreateRoomChange(room, action, username))

		response.Message = "Room successfully created."
	case UpdateAction:
		room, err := db.GetDB().UpdateRoom(roomID, room)
		if err != nil {
			response.Error = fmt.Sprintf("failed to update the room %s in the database", roomID)
			return response, nerr.Translate(err).Add(response.Error)
		}

		// record the change
		Master.UpdatedRooms = append(Master.UpdatedRooms, CreateRoomChange(room, action, username))

		response.Message = "Room successfully updated."

	case DeleteAction:
		err := db.GetDB().DeleteRoom(roomID)
		if err != nil {
			response.Error = fmt.Sprintf("failed to delete the room %s from the database", roomID)
			return response, nerr.Translate(err).Add(response.Error)
		}

		// record the change
		Master.DeletedRooms = append(Master.DeletedRooms, CreateRoomChange(room, action, username))

		response.Message = "Room successfully deleted."
	}

	// return the response
	response.Success = true
	return response, nil
}
