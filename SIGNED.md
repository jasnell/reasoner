##### Signed by https://keybase.io/jasnell
```
-----BEGIN PGP SIGNATURE-----
Comment: GPGTools - https://gpgtools.org

iQEcBAABCgAGBQJV+rP5AAoJEHNBsVwHCHesv30IAIfn1INgsLV7JMR91kp4pxyY
AWdxblQwAhqIOwcblRUjBFU4g8S3j4wsREIsS/Bcx1QQFxNb2BN6BhQnC+Q918iC
olMowIcBSSikVNGM2a797HPPBXpkNW3FpjZ7S0s6eSzhDHv4gvnq5KF7h26LkmN3
HTNuA8NYcW9+kRD1li1LnJBqny7BOm9eaFieGTUwkfhyhg/huPVzAajbHf7LyKZW
ZofNefAOI9W9T6YFQSMmCXZVBdcoEPjumMDkCQ0TmsLvZFXKzr8v46i70SHZTrs9
mAlcvQTMLmQ739pOcMo1PwWuwsIoJE+WfTOKYzGC4MwdTmTklv9EvhTd9cHYwbg=
=qZrj
-----END PGP SIGNATURE-----

```

<!-- END SIGNATURES -->

### Begin signed statement 

#### Expect

```
size   exec  file                      contents                                                        
             ./                                                                                        
13             .gitignore              16d30e4462189fb14dd611bdb708c510630c576a1f35b9383e89a4352da36c97
93             .jshintrc               ac72baaccc327aca1aa7b22eb98d0eec7b15a69cfc2fe5a568c6f086ba8e2197
21             .npmignore              db7c7703dda761d8eae3d95eb9e06747089ece470e853d11fa942136371e8e8f
               lib/                                                                                    
506              collector.js          b178f640b8a9f5c0b0e7516e667b72536c2f6a5f7783f5cf3de965114af20bc0
3325             graph.js              382e42bb629bc95b1e6ad5fa2d69322575409b3eaa181a4e2071092594360911
754              loading-lru-cache.js  99773522e7c7ca978ff969ff223f44c82a4f49edda41b40201b2793ed94a7d16
17647            reasoner.js           3daa51b1e6a2a5173d1306a7bf13e1945f8dc1f6eb08fec79b7da38398ca2415
1717             reduce.js             b1d9fbca5abb701e50352b2fd80af4634a195338ad6fefeb5fb3cb65042cf8c2
2369             xsd-graph.js          94cc8c9f8df39dae361ed57639b6442f559be232b498a18c5ca3c24a26d016fa
11381          LICENSE                 2bcf83b42c65720625611f1fb2922bc9e3face6a22117331a13c9ed9f3af2903
569            package.json            27727d36dc32890360c9f1a6adfe0ac1eac10d543e202f17b27a48e138597aeb
7299           README.md               7eb4873e14e2f5cc7a9d09af82104ced48f207045a79adb4b41eeb8bb26efe3f
               test/                                                                                   
7234             test.js               ada37a3d8595a90d6ba0a46f22ea274d4128c80d7f6f9753c49d5cc561dc9442
100              test.ttl              f8565fdf03792ac477fe70a38f11088b1cfefa4b4efa011d3747a65d539219c7
```

#### Ignore

```
/SIGNED.md
```

#### Presets

```
git      # ignore .git and anything as described by .gitignore files
dropbox  # ignore .dropbox-cache and other Dropbox-related files    
kb       # ignore anything as described by .kbignore files          
```

<!-- summarize version = 0.0.9 -->

### End signed statement

<hr>

#### Notes

With keybase you can sign any directory's contents, whether it's a git repo,
source code distribution, or a personal documents folder. It aims to replace the drudgery of:

  1. comparing a zipped file to a detached statement
  2. downloading a public key
  3. confirming it is in fact the author's by reviewing public statements they've made, using it

All in one simple command:

```bash
keybase dir verify
```

There are lots of options, including assertions for automating your checks.

For more info, check out https://keybase.io/docs/command_line/code_signing