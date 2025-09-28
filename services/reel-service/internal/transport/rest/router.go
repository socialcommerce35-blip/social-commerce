package http

import (
	"github.com/go-chi/chi/v5"
	"github.com/socialcommerce35-blip/social-commerce/services/reel-service/internal/usecase"
)

func NewRouter(uc *usecase.ReelUsecase, jwtSecret string) *chi.Mux {
	r := chi.NewRouter()

	handler := NewReelHandler(uc)

	// Public
	r.Get("/api/v1/reels", handler.ListAll)

	// Protected
	r.Group(func(pr chi.Router) {
		pr.Use(JWTMiddleware(jwtSecret))
		pr.Post("/api/v1/reels/upload", handler.Upload)
		pr.Get("/api/v1/reels/me", handler.ListMine)
	})

	return r
}
