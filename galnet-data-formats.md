## From the API at: `https://cms.elitedangerous.com/api/galnet` or `https://cms.elitedangerous.com/api/galnet-all`

A single article will appear in such a format:
```json
{
    "title": "Utopia Invites Superpowers to Galactic Summit",
    "body": "<p>Simguru Pranav Antal, leader of the Utopia commune, has proposed hosting a diplomatic conference for the governments of all three superpowers.<br /> The intention is to provide a neutral location to discuss key issues such as the renewed Thargoid attacks, the Marlinist refugee crisis, and hostilities between the Empire and the Federation.<br /> Details have been sent to the Alliance Assembly, Federal Congress and Imperial Senate. Pranav Antal has also broadcast his invitation across all media channels:<br /> “It is not Utopia’s tradition to become involved with politics, but recent events are of great concern to us all. Interstellar war, terrorism, alien incursion and economic collapse are the new four dark horsemen that threaten humanity’s future.”<br /> “We therefore offer to host a Galactic Summit where the Alliance, Empire and Federation may debate these problems peacefully. My sincere hope is that the heads of state grasp this opportunity to resolve their differences and create solutions that benefit their peoples.”<br /> Utopia is an independent society with a focus on using highly advanced technology to increase quality of life. Should this Galactic Summit take place, it would be the first diplomatic meeting of all three superpower governments.</p> ",
    "nid": 2258,
    "date": "01 JAN 3307",
    "image": "NewsImageTouristStation",
    "slug": "utopia-invites-superpowers-galactic-summit"
}
```

To access the direct website link to the article (not the archive), just replace `[slug]` with the slug from the article, like so:
```
https://www.elitedangerous.com/news/galnet/article/[slug]
```
Note, however, that articles with the same time will have the same slug, and therefore have their original article link overwritten with the latest post by the same title/slug.
To access one of the comma delimited images, you can use this link, replacing `[image]`, for one of the image values:
```
https://hosting.zaonce.net/elite-dangerous/galnet/[image].png
```
In a bunch of older articles, they sometimes start with the comma delimiter, meaning the images have since then been deleted.

## From the node gathered by the API

To remedy the issue of same title/slug posts, we can use the node id to get the json information, by replaceing `[nid]` with the post node id in the following url:
```
https://cms.elitedangerous.com/node/[nid]?_format=json
```

And the data format of those show up as follows:
```json
{
    "nid": [ { "value": 2270 } ],
    "uuid": [ { "value": "e69f425e-9d2d-46b2-9e98-7ac92ba1391a" } ],
    "vid": [ { "value": 3186 } ],
    "langcode": [ { "value": "en" } ],
    "type": [ { "target_id": "galnet_article",
                "target_type": "node_type",
                "target_uuid": "a9124f17-a175-463a-80fc-1cfc644824f4"
            } ],
    "revision_timestamp": [ { "value": "2021-01-01T00:18:05+00:00",
                              "format": "Y-m-d\TH:i:sP"
                          } ],
    "revision_uid": [ { "target_id": 0,
                        "target_type": "user",
                        "target_uuid": "78c40b48-ddb8-462f-a8b2-35be4f9ffbd4",
                        "url": "user/0"
                    } ],
    "revision_log": [ ],
    "status": [ { "value": true } ],
    "uid": [ { "target_id": 0,
               "target_type": "user",
               "target_uuid": "78c40b48-ddb8-462f-a8b2-35be4f9ffbd4",
               "url": "/user/0"
           } ],
    "title": [ { "value": "Utopia Invites Superpowers to Galactic Summit" } ],
    "created": [ { "value": "2021-01-01T00:18:05+00:00",
                   "format": "Y-m-d\TH:i:sP"
               } ],
    "changed": [ { "value": "2021-01-01T00:18:05+00:00",
                   "format": "Y-m-d\TH:i:sP"
               } ],
    "promote": [ { "value": true } ],
    "sticky": [ { "value": false } ],
    "default_langcode": [ { "value": true } ],
    "revision_translation_affected": [ { "value": true } ],
    "path": [ { "alias": null,
              "pid": null,
              "langcode": "en"
            } ],
    "body": [ { "value": "Simguru Pranav Antal, leader of the Utopia commune, has proposed hosting a diplomatic conference for the governments of all three superpowers. The intention is to provide a neutral location to discuss key issues such as the renewed Thargoid attacks, the Marlinist refugee crisis, and hostilities between the Empire and the Federation. Details have been sent to the Alliance Assembly, Federal Congress and Imperial Senate. Pranav Antal has also broadcast his invitation across all media channels: “It is not Utopia’s tradition to become involved with politics, but recent events are of great concern to us all. Interstellar war, terrorism, alien incursion and economic collapse are the new four dark horsemen that threaten humanity’s future.” “We therefore offer to host a Galactic Summit where the Alliance, Empire and Federation may debate these problems peacefully. My sincere hope is that the heads of state grasp this opportunity to resolve their differences and create solutions that benefit their peoples.” Utopia is an independent society with a focus on using highly advanced technology to increase quality of life. Should this Galactic Summit take place, it would be the first diplomatic meeting of all three superpower governments.",
                "format": null,
                "processed": "<p>Simguru Pranav Antal, leader of the Utopia commune, has proposed hosting a diplomatic conference for the governments of all three superpowers.<br /> The intention is to provide a neutral location to discuss key issues such as the renewed Thargoid attacks, the Marlinist refugee crisis, and hostilities between the Empire and the Federation.<br /> Details have been sent to the Alliance Assembly, Federal Congress and Imperial Senate. Pranav Antal has also broadcast his invitation across all media channels:<br /> “It is not Utopia’s tradition to become involved with politics, but recent events are of great concern to us all. Interstellar war, terrorism, alien incursion and economic collapse are the new four dark horsemen that threaten humanity’s future.”<br /> “We therefore offer to host a Galactic Summit where the Alliance, Empire and Federation may debate these problems peacefully. My sincere hope is that the heads of state grasp this opportunity to resolve their differences and create solutions that benefit their peoples.”<br /> Utopia is an independent society with a focus on using highly advanced technology to increase quality of life. Should this Galactic Summit take place, it would be the first diplomatic meeting of all three superpower governments.</p> ",
                "summary": null
            } ],
    "field_galnet_date": [ { "value": "01 JAN 3307" } ],
    "field_galnet_guid": [ { "value": "5fdce4b7b4ba847e4533d98een" } ],
    "field_galnet_image": [ { "value": "NewsImageTouristStation" } ],
    "field_slug": [ { "value": "utopia-invites-superpowers-galactic-summit" } ],
}
```

Most of this data is useless to us, but there are parities that you can obviously deduce. Using the `field_galnet_guid`, however, we can craft a link to where the archive article will be or already is at.

There is particularly some strangeness around the `field_galnet_guid` value however. Most newest posts will usually end in its actual langcode. All posts with `type[0].target_id` being `galnet_article` will always end in `en`, unless it's a very old article that hasn't been translated. When using the API to search for an article in a different langcode, the `type[0].target_id` comes `galnet_article_international`.

Anyways, dependant on if the GUID has a langcode appended to the end, you can craft one of the two archive URLs:
```
WITH LANGCODE AT END: field_galnet_guid will look like [guid][langcode]:
Here's what the URL would look like: https://community.elite-dangerous/[langcode]/galnet/[guid]

WITHOUT LANGCODE AT END: field_galnet_guid will look like [guid],
Here's what the URL would look like: https://community.elite-dangerous/galnet/[guid]
```

Not taking the langcode into account will cause the url to fail, and visa versa, trying to use a langcode on an article that didn't get translated, will cause the result to be blank.
