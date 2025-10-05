package config

import (
	"errors"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI           string
	MongoDB            string
	ProductsCollection string
	Port               string
	JWTSecret          string
	LogLevel           string
	RequestTimeout     time.Duration
}

func Load() (*Config, error) {
	_ = godotenv.Load()

	reqTimeoutMs := 5000
	if v := os.Getenv("REQUEST_TIMEOUT_MS"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil {
			reqTimeoutMs = parsed
		}
	}

	cfg := &Config{
		MongoURI:           os.Getenv("MONGO_URI"),
		MongoDB:            os.Getenv("MONGO_DB"),
		ProductsCollection: os.Getenv("MONGO_PRODUCTS_COLLECTION"),
		Port:               firstNonEmpty(os.Getenv("PORT"), "8080"),
		JWTSecret:          os.Getenv("JWT_SECRET"),
		LogLevel:           firstNonEmpty(os.Getenv("LOG_LEVEL"), "info"),
		RequestTimeout:     time.Millisecond * time.Duration(reqTimeoutMs),
	}

	if cfg.MongoURI == "" || cfg.MongoDB == "" || cfg.ProductsCollection == "" || cfg.JWTSecret == "" {
		return nil, errors.New("missing required env variables; see .env.example")
	}

	return cfg, nil
}

func firstNonEmpty(s, fallback string) string {
	if s != "" {
		return s
	}
	return fallback
}
