# Image Editor and Editing automation tool

Powerful image editor written on `React` + `TS` that allows to store custom filter configurations, upload images, process them and download in bulk.\
Written on top of [caman.js](http://camanjs.com/).

[Demo](https://image-manipulation-eight.vercel.app/)

## Examples
### Main View
![image](https://user-images.githubusercontent.com/53301511/152890252-45232b92-ce63-4c61-bfb4-662d682dfc7b.png)
### Configurations
Common layer configurations support many filters including brightness, contrast, exposure, noise, etc.

![image](https://user-images.githubusercontent.com/53301511/152890394-c6ee3b42-5152-4193-9e97-b3960c3ad8cd.png)
#### Configuration hints
Each base configuration has before / after hint that representes the applied filter. 

![image](https://user-images.githubusercontent.com/53301511/159764466-fbf8d585-536a-435f-8008-8139d3158bde.png)

### Layer configurations
Layer specific configurations, that are applied on top of the base layer
![image](https://user-images.githubusercontent.com/53301511/152890495-3dee2113-1bf5-43b1-a73e-882714cd9c39.png)

### Actions
Include:
* Adding / removing additional layers
* Saving applied filter configurations
* Selecting saved configurations and applying them to filter
* Deleting all configurations
* Resetting current layer's configuration / configuration of every level
* Copy / Past actions for layer configurations
* Automatic image downloading with applied effects 
* Target image display scale

![image](https://user-images.githubusercontent.com/53301511/159763618-ca2c6409-8b05-4b86-9acd-168f752363f7.png)
#### Save layer configuration view
![image](https://user-images.githubusercontent.com/53301511/152891038-996160f2-3e28-4c49-8dba-5e16e60a82e8.png)
### Custom image upload
![image](https://user-images.githubusercontent.com/53301511/152892284-a967d2fd-9ceb-4112-819e-b5af1b4e0a0d.png)


## Results
![image](https://user-images.githubusercontent.com/53301511/152891243-d4ea0340-82ea-4951-bca2-401961c52245.png)
![image](https://user-images.githubusercontent.com/53301511/152891467-3dd91708-abc2-45b2-8369-d4ab1d4aa567.png)
![image](https://user-images.githubusercontent.com/53301511/152891601-e5285a78-d98e-4fa5-9a43-da6cf39f98de.png)
![image](https://user-images.githubusercontent.com/53301511/152891915-120f1c58-775f-4032-90c6-d4673564ed3b.png)
![image](https://user-images.githubusercontent.com/53301511/152891977-387ba85f-6bdc-4f9a-9c29-cc68fd68244d.png)

### Installation
Clone repo, run
```bash
yarn && yarn dev
```
