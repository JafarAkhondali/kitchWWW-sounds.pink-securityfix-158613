# sounds.pink
### turn motion into music

## overview of product
sounds.pink is a pipeline for harnessing AI to allow you to translate movement, emotions, and device orientation into midi control data. It consists of a web site ([sounds.pink](https://sounds.pink)) that takes your position inputs, and a desktop application that contacts the server and outputs this data as midi information.

## overview of code
A couple of things live in this repo:

- the **website** is housed under `app` folder.
   - the core of the website is an Elastic Beanstalk nodejs server serving up pretty basic html+js+css pages.
   - the stage pages are powered by a combination of ml5js and face-api.js
   - larger files are linked via `res.sounds.pink`, a separate S3 bucket.
- the **Max/MSP** client is in the max folder. This is a "thin" wrapper that gives you raw data that comes straight from the website.
   - some example max patches are available under the `examples/max` folder!
- The **desktop application** is housed under zdesktop. It is a python app using `rtmidi` and `tkinter` for io and GUI components respectively. 

the site is accessible online at [https://sounds.pink](https://sounds.pink)

Currently we are in "make it work" mode. (meaning things are still quite broken)

## todo list:

- midi smoothing so the controls don't jump around sporadically. 
- automatically cleaning up old position files after a user has not messed with it for 24 hours.

If anyone wants to work on this with me, I would love to have some help making this project run!