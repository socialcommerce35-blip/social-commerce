package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Reel struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    string             `bson:"user_id" json:"user_id"`
	URL       string             `bson:"url" json:"url"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
}
