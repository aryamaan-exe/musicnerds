package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"crypto/sha256"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"time"
	"bytes"
	"context"
	"strconv"
	"encoding/base64"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/cloudinary/cloudinary-go/v2"
  	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"golang.org/x/crypto/bcrypt"
)

type User struct {
    Username string `json:"username"`
    Email    string `json:"email"`
    Password string `json:"password"`
	Bio		 string `json:"bio"`
}

type PfpChange struct {
  Username  string `json:"username"`
  AuthToken string `json:"authToken"`
  Pfp       string `json:"pfp"`
}

type MtRush struct {
	Username  string `json:"username"`
	AuthToken string `json:"authToken"`
	I 		  int 	 `json:"i"`
	Album	  string `json:"album"`
}

type Post struct {
	Username  string `json:"username"`
	AuthToken string `json:"authToken"`
	Image	  string `json:"image"`
	Title 	  string `json:"title"`
	Body 	  string `json:"body"`
}

type Like struct {
	Username  string `json:"username"`
	AuthToken string `json:"authToken"`
	PostID	  int 	 `json:"postID"`
	Remove	  bool	 `json:"remove"`
}

func getAuthToken(password string, username string) string {
	sum := sha256.Sum256([]byte(password + username + os.Getenv("SALT")))
    return fmt.Sprintf("%x", sum)
}

func authenticated(username string, authToken string, db *sql.DB) (bool) {
	rows, err := db.Query("SELECT password FROM users WHERE username=$1", username)
	if err != nil {
		return false
	}
	rows.Next()
	var password string
	rows.Scan(&password)
	token := getAuthToken(password, username)
	fmt.Println(string(token))
	return string(token) == authToken
}

func main() {
	if os.Getenv("PORT") == "" {
		_ = godotenv.Load()
	}
	url := os.Getenv("URL")
	db, err := sql.Open("postgres", url)
    if err != nil {
        log.Fatal(err)
    }
	defer db.Close()
	
	err = db.Ping()
    if err != nil {
        log.Fatal(err)
    }
	fmt.Println("Successfully connected to the database!")
	db.Exec("DELETE FROM pg_stat_activity WHERE state = 'idle'")

	r := gin.Default()

	r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"*"},
        AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

	// /health - Health check for cron job (remove if upgrading Render)
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Status OK"})
	})

	// /register - Takes username, email, and password, and stores the record into users after hashing.
	r.POST("/register", func(c *gin.Context) {
		var user User
        if err := c.BindJSON(&user); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
            return
		}
		
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
            return
        }

		// db.Exec("DELETE FROM users")
		// db.Exec("DELETE FROM mtrush")
		_, err = db.Exec("INSERT INTO users (username, password, email, bio, pfp) VALUES ($1, $2, $3, '', 'https://images.unsplash.com/broken')", user.Username, string(hashedPassword), user.Email)
		if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Username is taken, choose another"})
            return
        }

		res := db.QueryRow("SELECT id FROM users WHERE username=$1", user.Username)
		var id int
		res.Scan(&id)

		_, err = db.Exec("INSERT INTO mtrush (id, first, second, third, fourth) VALUES ($1, '', '', '', '')", id)
		if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Error adding to database"})
            return
        }

		authToken := getAuthToken(string(hashedPassword), user.Username)
		
        c.JSON(http.StatusOK, gin.H{
            "message": "User registered successfully",
			"authToken": authToken,
        })
	})
	
	// /login takes in username and password, queries users and returns auth token on successful login.
	r.POST("/login", func(c *gin.Context) {
		var user User
		
		if err := c.BindJSON(&user); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
            return
		}

		rows, err := db.Query("SELECT password FROM users WHERE username=$1", user.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Incorrect username or password"})
			return
		}
		defer rows.Close()

		var hashedPassword string
		rows.Next()
		rows.Scan(&hashedPassword)
		
		err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(user.Password))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Incorrect username or password"})
			return
		}

		authToken := getAuthToken(hashedPassword, user.Username)

		c.JSON(http.StatusOK, gin.H{
            "message": "User logged in successfully",
			"authToken": authToken,
        })
	})

	// /user takes in the username and returns user info. Also checks if current user is same as queried user through auth token.
	r.GET("/user", func(c *gin.Context) {
		username := c.Query("username")
		authToken := c.Query("authToken")

		rows, err := db.Query("SELECT bio, pfp FROM users WHERE username=$1", username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database query error"})
			return
		}
		defer rows.Close()

		if !rows.Next() {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		var bio string
		var pfp string
		err = rows.Scan(&bio, &pfp)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read user data"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "User found",
			"bio": bio,
			"pfp": pfp,
			"me": authenticated(username, authToken, db),
		})
	})

	// /changeBio changes bio after authentication.
	r.POST("/changeBio", func(c *gin.Context) {
		var user User
		if err := c.BindJSON(&user); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
            return
		}

		_, err := db.Exec("UPDATE users SET bio=$1 WHERE username=$2", user.Bio, user.Username)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update bio in database"})
            return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Bio updated",
			"bio": user.Bio,
		})
	})

	// /changePfp changes profile pic after authentication using Cloudinary.
	r.POST("/changePfp", func(c *gin.Context) {
		var in PfpChange
		if err := c.BindJSON(&in); err != nil {
			fmt.Println("a")
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		data, err := base64.StdEncoding.DecodeString(in.Pfp)
		if err != nil {
			fmt.Println("b")
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid base64"})
			return
		}

		cld, err := cloudinary.NewFromParams(
			os.Getenv("CLOUDINARY_CLOUD_NAME"),
			os.Getenv("CLOUDINARY_API_KEY"),
			os.Getenv("CLOUDINARY_API_SECRET"),
		)

		if err != nil {
			fmt.Println("c")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Error connecting to image host"})
			return
		}

		reader := bytes.NewReader(data)
		resp, err := cld.Upload.Upload(
			context.Background(),
			reader,
			uploader.UploadParams{
			Folder:       "user_avatars",
			PublicID:     in.Username,
			Overwrite:    func(b bool) *bool { return &b }(true),
			ResourceType: "image",
			},
		)
		if err != nil {
			fmt.Println("d")
			c.JSON(http.StatusBadRequest, gin.H{"error": "Error uploading to image host"})
			return
		}

		_, err = db.Exec("UPDATE users SET pfp=$1 WHERE username=$2", resp.SecureURL, in.Username)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update profile picture in database"})
            return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Profile picture updated", "pfp": resp.SecureURL})
	})

	// /mtRush gets the Mt. Rushmore for a user. Could be changed to a single endpoint with /user.
	r.GET("/mtRush", func(c *gin.Context) {
		username := c.Query("username")
		row := db.QueryRow("SELECT id FROM users WHERE username=$1", username)
		var id int
		row.Scan(&id)
		var first string
		var second string
		var third string
		var fourth string

		row = db.QueryRow("SELECT * FROM mtRush WHERE id=$1", id)
		row.Scan(&id, &first, &second, &third, &fourth)

		c.JSON(http.StatusOK, gin.H{
			"message": "Obtained Mt. Rushmore",
			"mtRush": [4]string{ first, second, third, fourth },
		})
	})

	// /removeMtRush removes a particular album from Mt. Rushmore at a specific spot (1-4).
	r.POST("/removeMtRush", func(c *gin.Context) {
		var remove MtRush
		if err := c.BindJSON(&remove); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
            return
		}
		if !authenticated(remove.Username, remove.AuthToken, db) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
			return
		}
		row := db.QueryRow("SELECT id FROM users WHERE username=$1", remove.Username)
		var id int
		row.Scan(&id)
		var index string
		switch remove.I {
		case 1:
			index = "first"
		case 2:
			index = "second"
		case 3:
			index = "third"
		default:
			index = "fourth"
		}

		_, err = db.Exec(fmt.Sprintf("UPDATE mtRush SET %s='' WHERE id=$1", index), id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Couldn't remove album"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Removed album from Mt. Rushmore",
		})
	})

	r.POST("/updateMtRush", func(c *gin.Context) {
		var update MtRush
		if err := c.BindJSON(&update); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
            return
		}
		if !authenticated(update.Username, update.AuthToken, db) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized request"})
			return
		}
		row := db.QueryRow("SELECT id FROM users WHERE username=$1", update.Username)
		var id int
		row.Scan(&id)
		var index string
		switch update.I {
		case 1:
			index = "first"
		case 2:
			index = "second"
		case 3:
			index = "third"
		default:
			index = "fourth"
		}

		_, err = db.Exec(fmt.Sprintf("UPDATE mtRush SET %s=$1 WHERE id=$2", index), update.Album, id)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Couldn't update album"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Updated Mt. Rushmore",
		})
	})

	// /feed returns paginated posts by a user. Currently set to 10 posts.
	r.GET("/feed", func(c *gin.Context) {
		username := c.Query("username")
		page, err := strconv.Atoi(c.Query("page"))

		if err != nil {
			return
		}
		
		offset := (page - 1) * 10
		row := db.QueryRow("SELECT id FROM users WHERE username=$1", username)
		var id int
		row.Scan(&id)
		// LIMIT 10 -> 10 posts, OFFSET is a multiple of 10
        rows, err := db.Query("SELECT postid, title, body, image, timestamp FROM feed WHERE id=$1 ORDER BY timestamp DESC LIMIT 10 OFFSET $2", id, offset)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
            return
        }
        defer rows.Close()
		
		var feed []map[string]interface{}
        for rows.Next() {
            var postid int
            var title, body, image string
			var timestamp time.Time
            err = rows.Scan(&postid, &title, &body, &image, &timestamp)
            if err != nil {
				fmt.Println(err)
                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan row"})
                return
            }
			countQuery := db.QueryRow("SELECT COUNT(*) FROM likes WHERE postid=$1 GROUP BY postid", postid)
			var likeCount int
			countQuery.Scan(&likeCount)

            feed = append(feed, map[string]interface{}{
                "postid": 	 postid,
                "title":  	 title,
                "body":  	 body,
                "image":  	 image,
				"timestamp": timestamp.Format(time.RFC3339),
				"likes":	 likeCount,
            })
        }

		c.JSON(http.StatusOK, gin.H{
            "message": fmt.Sprintf("Page %d of %s's feed obtained", page, username),
            "feed":    feed,
        })
	})

	r.POST("/post", func(c *gin.Context) {
		var post Post
		
		if err := c.BindJSON(&post); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
            return
		}
		row := db.QueryRow("SELECT id FROM users WHERE username=$1", post.Username)
		var id int
		row.Scan(&id)

		if authenticated(post.Username, post.AuthToken, db) {
			_, err = db.Exec("INSERT INTO feed (id, title, body, image) VALUES ($1, $2, $3, $4)", id, post.Title, post.Body, post.Image)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Post added"})
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		}
		
	})

	r.GET("/likes", func(c *gin.Context) {
		row := db.QueryRow("SELECT id FROM users WHERE username=$1", c.Query("username"))
		var id int
		row.Scan(&id)

		rows, err := db.Query("SELECT postid FROM likes WHERE id=$1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error querying database"})
            return
		}

		var likes []int
		var postID int
		for rows.Next() {
			rows.Scan(&postID)
			likes = append(likes, postID)
		}

		c.JSON(http.StatusOK, gin.H{"likes": likes})

	})

	r.POST("/like", func(c *gin.Context) {
		var like Like
		
		if err := c.BindJSON(&like); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
            return
		}
		row := db.QueryRow("SELECT id FROM users WHERE username=$1", like.Username)
		var id int
		row.Scan(&id)

		if authenticated(like.Username, like.AuthToken, db) {
			if like.Remove {
				_, err = db.Exec("DELETE FROM likes WHERE postid=$1 AND id=$2", like.PostID, id)
			} else {
				fmt.Println(like.PostID, id);
				_, err = db.Exec("INSERT INTO likes VALUES ($1, $2)", like.PostID, id)
			}
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"message": "Post liked"})
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		}
		
	})

	port := os.Getenv("PORT")
    if port == "" {
        port = "8000" 
    }
	r.Run("0.0.0.0:" + port);
}
