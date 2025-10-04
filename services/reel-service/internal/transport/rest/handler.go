package http

import (
	"net/http"

	"github.com/socialcommerce35-blip/social-commerce/services/reel-service/internal/usecase"
)

type ReelHandler struct {
	uc *usecase.ReelUsecase
}

func NewReelHandler(uc *usecase.ReelUsecase) *ReelHandler {
	return &ReelHandler{uc: uc}
}

func (h *ReelHandler) Upload(w http.ResponseWriter, r *http.Request) {
	userID := UserIDFromContext(r.Context())
	if userID == "" {
		respondJSON(w, http.StatusUnauthorized, false, nil, "unauthorized")
		return
	}

	file, fileHeader, err := r.FormFile("video")
	if err != nil {
		respondJSON(w, http.StatusBadRequest, false, nil, "file required")
		return
	}
	defer file.Close()

	reel, err := h.uc.UploadReel(r.Context(), file, fileHeader, userID)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, false, nil, err.Error())
		return
	}

	respondJSON(w, http.StatusCreated, true, reel, "")
}

func (h *ReelHandler) ListAll(w http.ResponseWriter, r *http.Request) {
	reels, err := h.uc.ListAll(r.Context())
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, false, nil, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, true, reels, "")
}

func (h *ReelHandler) ListMine(w http.ResponseWriter, r *http.Request) {
	userID := UserIDFromContext(r.Context())
	if userID == "" {
		respondJSON(w, http.StatusUnauthorized, false, nil, "unauthorized")
		return
	}
	reels, err := h.uc.ListByUser(r.Context(), userID)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, false, nil, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, true, reels, "")
}
