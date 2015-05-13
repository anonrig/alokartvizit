<?php

$files = scandir(".", 1);
        for ($i = 0; $i < count($files); $i++) {
            if(is_dir($files[$i]) && $files[$i] != "." && $files[$i] != "..")
            echo $files[$i] . "<br>"; 
        }