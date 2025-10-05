package middleware

import (
	"net/http"
	"time"

	"go.uber.org/zap"
)

func RequestLogger(log *zap.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			ip := r.RemoteAddr
			if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
				ip = fwd
			}

			log.Info("incoming request",
				zap.String("method", r.Method),
				zap.String("path", r.URL.Path),
				zap.String("ip", ip),
				zap.String("user_agent", r.UserAgent()),
			)

			next.ServeHTTP(w, r)

			log.Info("request completed",
				zap.String("method", r.Method),
				zap.String("path", r.URL.Path),
				zap.String("ip", ip),
				zap.Duration("duration", time.Since(start)),
			)
		})
	}
}

func Recoverer(log *zap.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			defer func() {
				if err := recover(); err != nil {
					log.Error("panic recovered", zap.Any("error", err))
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusInternalServerError)
					w.Write([]byte(`{"success":false,"data":null,"error":"internal server error","code":500}`))
				}
			}()
			next.ServeHTTP(w, r)
		})
	}
}
