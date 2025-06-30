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
	"encoding/base64"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/cloudinary/cloudinary-go/v2"
  	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	// "github.com/golang-jwt/jwt"
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

type Remove struct {
	Username  string `json:"username"`
	i 		  int 	 `json:"i"`
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
	return string(token) == authToken
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(err)
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

	r := gin.Default()

	r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3001"},
        AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

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

		db.Exec("DELETE FROM users")
		db.Exec("DELETE FROM mtrush")
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

	r.POST("/changePfp", func(c *gin.Context) {
		var in PfpChange
		if err := c.BindJSON(&in); err != nil {
			fmt.Println("a")
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		data, err := base64.StdEncoding.DecodeString(in.Pfp)
		if err != nil {
			fmt.Println("b")
			c.JSON(400, gin.H{"error": "invalid base64"})
			return
		}

		cld, err := cloudinary.NewFromParams(
			os.Getenv("CLOUDINARY_CLOUD_NAME"),
			os.Getenv("CLOUDINARY_API_KEY"),
			os.Getenv("CLOUDINARY_API_SECRET"),
		)

		if err != nil {
			fmt.Println("c")
			c.JSON(400, gin.H{"error": "Error connecting to image host"})
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
			c.JSON(400, gin.H{"error": "Error uploading to image host"})
			return
		}

		_, err = db.Exec("UPDATE users SET pfp=$1 WHERE username=$2", resp.SecureURL, in.Username)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update profile picture in database"})
            return
		}
		c.JSON(200, gin.H{"message": "Profile picture updated", "pfp": resp.SecureURL})
	})

	r.GET("/mtRush", func(c *gin.Context) {
		username := c.Query("username")
		row := db.QueryRow("SELECT id FROM users WHERE username=$1", username)
		var id int
		row.Scan(&id)
		row = db.QueryRow("SELECT * FROM mtRush WHERE id=$1", id)
		row.Scan(&id)
		var first string
		var second string
		var third string
		var fourth string
		row.Scan(&first, &second, &third, &fourth)

		c.JSON(200, gin.H{
			"message": "Obtained Mt. Rushmore",
			"mtRush": [4]string{ first, second, third, fourth },
		})
	})

	r.POST("/removeMtRush", func(c *gin.Context) {
		var remove Remove
		if err := c.BindJSON(&remove); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
            return
		}
		row := db.QueryRow("SELECT id FROM users WHERE username=$1", remove.Username)
		var id int
		row.Scan(&id)
		var index string
		switch remove.i {
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

		c.JSON(200, gin.H{
			"message": "Removed album from Mt. Rushmore",
		})
	})

	

	r.Run(":8000")
}