package quartermaster

/*
import (
	"log"
	"os"
)

type Cache interface {
	FillDeviceStatusCache(db CouchDB) error
}

var address string
var username string
var password string

var cache Cache

func init() {
	address = os.Getenv("DB_ADDRESS")
	username = os.Getenv("DB_USERNAME")
	password = os.Getenv("DB_PASSWORD")

	if len(address) == 0 {
		log.Fatalf("DB_ADDRESS is not set. Can not create a cache. Failing...")
	}
}

// GetCache returns the instance of the cache to use.
func GetCache() Cache {
	if cache == nil {
		cache = NewCache(address, username, password)
	}

	return cache
}
*/
