package infra

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all environment variables for the Reel service
type Config struct {
	Port          string // Service port
	MongoURI      string // MongoDB connection string
	GCSBucketName string // Google Cloud Storage bucket name
	GCSProjectID  string // GCP project ID
	GCSCredsFile  string // Path to GCS JSON credentials file
	JWTSecret     string // JWT signing secret
	MaxUploadMB   int    // Max upload size in MB
}

// LoadConfig loads environment variables from .env file or system
func LoadConfig() *Config {
	// Load .env file if present
	if err := godotenv.Load(); err != nil {
		log.Println("No .env found, using system env variables")
	}

	maxUpload := 10 // default 10MB
	if val := getEnv("MAX_UPLOAD_MB"); val != "" {
		if parsed, err := strconv.Atoi(val); err == nil {
			maxUpload = parsed
		}
	}

	return &Config{
		Port:          getEnv("PORT"),
		MongoURI:      getEnv("MONGO_URI"),
		GCSBucketName: getEnv("GCS_BUCKET_NAME"),
		GCSProjectID:  getEnv("GCS_PROJECT_ID"),
		GCSCredsFile:  getEnv("GCS_CREDENTIALS_JSON"),
		JWTSecret:     getEnv("JWT_SECRET"),
		MaxUploadMB:   maxUpload,
	}
}

// getEnv reads an environment variable or returns the default value
func getEnv(key string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return ""
}
