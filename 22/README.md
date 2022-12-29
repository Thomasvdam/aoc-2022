# Notes

This is a terrible solution that doesn't work for all sorts of inputs. Cubes that are 1x1x1 will bork out, and several cube unfoldings will also not be solved properly:

```
   xxx
   xxx
   xxx
xxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx
xxxxxxxxxxxxxxx
   xxx
   xxx
   xxx
```

Furthermore the code is atrocious, lots of unneeded iterations over the input, ugly copy paste code that could be made more generic and reusable. However, it is my own solution and it gets the job done so for now I am leaving this as is.
