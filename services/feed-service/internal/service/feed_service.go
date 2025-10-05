package service

import (
	"context"
	"time"

	"github.com/socialcommerce35-blip/social-commerce/services/feed-service/internal/repository"
	"go.mongodb.org/mongo-driver/bson"
	"go.uber.org/zap"
)

type FeedService interface {
	GetFeed(ctx context.Context, styles, brands []string, limit int64, lastID interface{}, sortField string, sortDir int) ([]bson.M, interface{}, error)
}

type feedService struct {
	repo       repository.ProductRepo
	log        *zap.Logger
	reqTimeout time.Duration
}

func NewFeedService(repo repository.ProductRepo, log *zap.Logger, reqTimeout time.Duration) FeedService {
	return &feedService{repo: repo, log: log, reqTimeout: reqTimeout}
}

func (s *feedService) GetFeed(ctx context.Context, styles, brands []string, limit int64, lastID interface{}, sortField string, sortDir int) ([]bson.M, interface{}, error) {
	ctx, cancel := context.WithTimeout(ctx, s.reqTimeout)
	defer cancel()

	if limit <= 0 || limit > 100 {
		limit = 50
	}

	filter := bson.M{}
	if len(styles) > 0 {
		filter["style"] = bson.M{"$in": styles}
	}
	if len(brands) > 0 {
		filter["brand_name"] = bson.M{"$in": brands} // ✅ correct field
	}

	sort := bson.D{{Key: sortField, Value: sortDir}}

	s.log.Info("fetching feed",
		zap.Int64("limit", limit),
		zap.Strings("styles", styles),
		zap.Strings("brands", brands),
		zap.Any("lastID", lastID),
	)

	items, err := s.repo.FindFeed(ctx, filter, sort, limit, lastID)
	if err != nil {
		s.log.Error("repo FindFeed failed", zap.Error(err))
		return nil, nil, err
	}

	var nextID interface{}
	if len(items) > 0 {
		nextID = items[len(items)-1]["_id"]
	}

	return items, nextID, nil
}