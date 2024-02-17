package io.pdywilson.kotlinhtml

import kotlinx.html.BODY
import kotlinx.html.HTML
import kotlinx.html.audio
import kotlinx.html.body
import kotlinx.html.div
import kotlinx.html.dom.append
import kotlinx.html.dom.document
import kotlinx.html.dom.serialize
import kotlinx.html.head
import kotlinx.html.html
import kotlinx.html.lang
import kotlinx.html.meta
import kotlinx.html.script
import kotlinx.html.source
import kotlinx.html.unsafe
import java.io.File

data class Song(
    val name: String,
    val file: String,
) {
    constructor(file: String) : this(file, file)
}

data class Section(
    val name: String,
    val folder: String,
    val songs: List<Song>,
)

val page = listOf(
    Section(
        name = "Queen of the Ocean EP",
        folder = "queen",
        songs = listOf(
            Song("Mr Skeep","mrskeep5master3.mp3"),
            Song("StJackDillac", "stjackdillac_final2.mp3"),
            Song("Finally Free", "finallyfree18.mp3"),
            Song("Lacanau", "lacanau2.mp3"),
            Song("Queen of the Ocean", "alrightqueenv11onmini.mp3"),
        )
    ),
    Section(
        name = "Dr Bozo",
        folder = "bozo",
        songs = listOf(
            "groovy4.mp3",
            "gurkenvibes3.mp3",
            "magnetizedv4.mp3",
            "nastyv2.mp3",
            "rapmittomate2.mp3",
            "ride5.mp3",
            "wakeup.mp3",
            ).map { Song(it) }
    ),
    Section(
        name = "Bits & Scraps from Spain",
        folder = "bits",
        songs = listOf(
            "alleyezonher2.mp3",
            "bananenbrot.mp3",
            "bouncingonbobs.mp3",
            "caseyneistat.mp3",
            "clean.mp3",
            "comethru.mp3",
            "discopop.mp3",
            "dojacatjuicyjdillabeat.mp3",
            "gimmedaticecream.mp3",
            "lilpeep1.mp3",
            "ride2.mp3",
            "promdress.mp3",
            "pumpbass.mp3",
            "spanklayyoudownbeat.mp3",
            "whisperywillows.mp3",
        ).map { Song(it) }
    ),
)

fun main() {
    val myDocument = document { }

    myDocument.append {
        html {
            lang = "en"
            addHead()
            addBody()
        }
    }

    myDocument.serialize()
        .also(::println)
        .also {
            File("index.html").writeText(it)
        }
}

private fun HTML.addBody() {
    body {
        addPage()
        addCopyright()
    }
}

private fun BODY.addCopyright() {
    div {
        +"Copyright © Patrick Wilson 2019 - "
        script {
            unsafe {
                raw("document.write(new Date().getFullYear())")
            }
        }
    }
}

private fun BODY.addPage() {
    page.forEach { section ->
        addSection(section)
    }
}

private fun BODY.addSection(section: Section) {
    div { +section.name }
    section.songs.forEach { song ->
        addSong(song, section)
    }
}

private fun BODY.addSong(song: Song, section: Section) {
    div { +song.name }
    div {
        audio {
            controls = true
            source {
                src = "${section.folder}/${song.file}"
                type = "audio/mpeg"
            }
        }
    }
}

private fun HTML.addHead() {
    head {
        meta {
            name = "viewport"
            content = "width=device-width, initial-scale=1.0"
        }
    }
}