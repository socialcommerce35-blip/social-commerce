package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/socialcommerce35-blip/social-commerce/services/feed-service/internal/service"
	"github.com/socialcommerce35-blip/social-commerce/services/feed-service/internal/utils"
	"go.uber.org/zap"
)

type FeedHandler struct {
	svc service.FeedService
	log *zap.Logger
}

func NewFeedHandler(svc service.FeedService, log *zap.Logger) *FeedHandler {
	return &FeedHandler{svc: svc, log: log}
}

func (h *FeedHandler) GetFeed(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	page, _ := strconv.ParseInt(q.Get("page"), 10, 64)
	limit, _ := strconv.ParseInt(q.Get("limit"), 10, 64)
	sortField := q.Get("sortField")
	if sortField == "" {
		sortField = "created_at"
	}
	sortDir := -1
	if q.Get("sortDir") == "asc" {
		sortDir = 1
	}

	styles := []string{}
	if s := q.Get("styles"); s != "" {
		styles = strings.Split(s, ",")
	}
	brands := []string{}
	if b := q.Get("brands"); b != "" {
		brands = strings.Split(b, ",")
	}

	items, total, err := h.svc.GetFeed(r.Context(), styles, brands, page, limit, sortField, sortDir)
	if err != nil {
		h.log.Error("GetFeed failed", zap.Error(err))
		utils.RespondWithError(w, http.StatusInternalServerError, "failed to fetch feed")
		return
	}

	resp := map[string]interface{}{
		"items": items,
		"total": total,
	}

	utils.RespondWithSuccess(w, resp)
}
