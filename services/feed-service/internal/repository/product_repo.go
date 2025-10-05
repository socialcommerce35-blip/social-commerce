package repository

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.uber.org/zap"
)

type ProductRepo interface {
	FindFeed(ctx context.Context, filter bson.M, sort bson.D, limit int64, lastID interface{}) ([]bson.M, error)
	Count(ctx context.Context, filter bson.M) (int64, error)
}

type mongoProductRepo struct {
	coll *mongo.Collection
	log  *zap.Logger
}

func NewProductRepo(coll *mongo.Collection, log *zap.Logger) ProductRepo {
	return &mongoProductRepo{coll: coll, log: log}
}

func (m *mongoProductRepo) FindFeed(ctx context.Context, filter bson.M, sort bson.D, limit int64, lastID interface{}) ([]bson.M, error) {
	findOpts := options.Find().SetLimit(limit).SetSort(sort)

	// Use type assertion for lastID
	if lastID != nil {
		if oid, ok := lastID.(primitive.ObjectID); ok && oid != primitive.NilObjectID {
			filter["_id"] = bson.M{"$lt": oid}
		} else {
			m.log.Warn("invalid lastID type or nil, ignoring", zap.Any("lastID", lastID))
		}
	}

	// Only return needed fields
	findOpts.SetProjection(bson.M{
		"_id":        1,
		"title":      1,
		"brand_name": 1,
		"style":      1,
		"price":      1,
	})

	// Debug logs
	fmt.Printf("Mongo filter: %+v\n", filter)
	fmt.Printf("Mongo sort: %+v, limit: %d\n", sort, limit)

	cur, err := m.coll.Find(ctx, filter, findOpts)
	if err != nil {
		m.log.Error("mongo find error", zap.Error(err))
		return nil, err
	}
	defer cur.Close(ctx)

	var res []bson.M
	for cur.Next(ctx) {
		var doc bson.M
		if err := cur.Decode(&doc); err != nil {
			m.log.Error("decode product failed", zap.Error(err))
			return nil, err
		}
		res = append(res, doc)
	}

	if err := cur.Err(); err != nil {
		m.log.Error("cursor error", zap.Error(err))
		return nil, err
	}

	fmt.Printf("Products fetched: %d\n", len(res))
	if res == nil {
		res = []bson.M{} // avoid returning null
	}
	return res, nil
}

// FindFeed now uses cursor-based pagination via lastID
func (m *mongoProductRepo) Count(ctx context.Context, filter bson.M) (int64, error) {
	cnt, err := m.coll.CountDocuments(ctx, filter)
	if err != nil {
		m.log.Error("count documents error", zap.Error(err))
		return 0, err
	}
	return cnt, nil
}
