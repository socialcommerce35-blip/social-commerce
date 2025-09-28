package usecase

import (
	"context"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"time"

	"github.com/google/uuid"
	"github.com/socialcommerce35-blip/social-commerce/services/reel-service/internal/domain"
	"github.com/socialcommerce35-blip/social-commerce/services/reel-service/internal/infra"
	"github.com/socialcommerce35-blip/social-commerce/services/reel-service/internal/repository"
)

type ReelUsecase struct {
	repo *repository.ReelRepo
	gcs  *infra.GCSClient
}

func NewReelUsecase(repo *repository.ReelRepo, gcs *infra.GCSClient) *ReelUsecase {
	return &ReelUsecase{repo: repo, gcs: gcs}
}

func (u *ReelUsecase) UploadReel(ctx context.Context, file multipart.File, fileHeader *multipart.FileHeader, userID string) (*domain.Reel, error) {
	// Validate format
	if filepath.Ext(fileHeader.Filename) != ".mp4" {
		return nil, fmt.Errorf("invalid format, only .mp4 allowed")
	}
	if fileHeader.Size > 10*1024*1024 {
		return nil, fmt.Errorf("file too large, max 10MB")
	}

	// Upload to GCS
	fileName := fmt.Sprintf("%s_%d.mp4", uuid.New().String(), time.Now().Unix())
	url, err := u.gcs.Upload(ctx, file, fileName)
	if err != nil {
		return nil, err
	}

	reel := &domain.Reel{
		UserID: userID,
		URL:    url,
	}
	if err := u.repo.Save(ctx, reel); err != nil {
		return nil, err
	}
	return reel, nil
}

func (u *ReelUsecase) ListAll(ctx context.Context) ([]domain.Reel, error) {
	return u.repo.ListAll(ctx)
}

func (u *ReelUsecase) ListByUser(ctx context.Context, userID string) ([]domain.Reel, error) {
	return u.repo.ListByUser(ctx, userID)
}
