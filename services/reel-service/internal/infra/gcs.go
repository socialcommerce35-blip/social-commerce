package infra

import (
	"context"
	"fmt"
	"io"
	"time"

	"cloud.google.com/go/storage"
	"google.golang.org/api/option"
)

type GCSClient struct {
	client *storage.Client
	bucket string
}

func NewGCSClient(ctx context.Context, bucketName, credentialsFile string) (*GCSClient, error) {
	client, err := storage.NewClient(ctx, option.WithCredentialsFile(credentialsFile))
	if err != nil {
		return nil, err
	}
	return &GCSClient{client: client, bucket: bucketName}, nil
}

func (g *GCSClient) Upload(ctx context.Context, file io.Reader, fileName string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, time.Second*50)
	defer cancel()

	wc := g.client.Bucket(g.bucket).Object(fileName).NewWriter(ctx)
	if _, err := io.Copy(wc, file); err != nil {
		return "", err
	}
	if err := wc.Close(); err != nil {
		return "", err
	}

	// Public URL
	url := fmt.Sprintf("https://storage.googleapis.com/%s/%s", g.bucket, fileName)
	return url, nil
}

func (g *GCSClient) BucketName() string {
    return g.bucket
}