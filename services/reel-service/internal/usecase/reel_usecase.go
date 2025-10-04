package usecase

import (
	"bytes"
	"context"
	"fmt"
	"mime/multipart"
	"io"
	"os/exec"
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
    // Max size check
    if fileHeader.Size > 10*1024*1024 {
        return nil, fmt.Errorf("file too large, max 10MB")
    }

    // Generate GCS file name and initial metadata
    fileName := fmt.Sprintf("%s_%d.mp4", uuid.New().String(), time.Now().Unix())
    reel := &domain.Reel{
        UserID: userID,
        URL:    fmt.Sprintf("https://storage.googleapis.com/%s/%s", u.gcs.BucketName(), fileName),
    }

    // Save initial metadata (optional)
    if err := u.repo.Save(ctx, reel); err != nil {
        return nil, err
    }

    // Read uploaded file into memory (required because request stream closes)
    data, err := io.ReadAll(file)
    if err != nil {
        return nil, err
    }

    // Launch background goroutine for conversion + upload
    go func(data []byte, fh *multipart.FileHeader, reel *domain.Reel) {
        reader := bytes.NewReader(data)

        pr, pw := io.Pipe()
        cmd := exec.Command("ffmpeg",
            "-i", "pipe:0",
            "-c:v", "libx264",
            "-c:a", "aac",
            "-f", "mp4",
            "pipe:1",
        )
        cmd.Stdin = reader
        cmd.Stdout = pw
        cmd.Stderr = io.Discard

        go func() {
            defer pw.Close()
            _ = cmd.Run()
        }()

        // Upload converted video to GCS
        if _, err := u.gcs.Upload(context.Background(), pr, fileName); err != nil {
            fmt.Println("async upload failed:", err)
            return
        }

        fmt.Println("✅ Video conversion + upload finished:", fh.Filename)
    }(data, fileHeader, reel)

    // Return immediately to client
    return reel, nil
}

func (u *ReelUsecase) ListAll(ctx context.Context) ([]domain.Reel, error) {
	return u.repo.ListAll(ctx)
}

func (u *ReelUsecase) ListByUser(ctx context.Context, userID string) ([]domain.Reel, error) {
	return u.repo.ListByUser(ctx, userID)
}
