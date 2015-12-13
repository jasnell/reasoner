##### Signed by https://keybase.io/jasnell
```
-----BEGIN PGP SIGNATURE-----
Comment: GPGTools - https://gpgtools.org

iQEcBAABCgAGBQJWbPtRAAoJEHNBsVwHCHesdZYIAIZsPwSA3D+aIcB+41tlGMY9
4xmEWVNuTqgnemUjl/zL51miDIIZTuNrvkcfJ32K8/PT51t/RXh5yhqo3zgos0P4
0hYyYv1x4MsCcHNhvrb/zAuQDp4k3HmZ7b4ESob+ABizWb1Mh/bltOQgMslHUG/5
vwmgRpawuJhmi0s7fCeLJZXjtnhWioffOyPU2MOFFPCgminsb/LepJLwkRY2EO1t
DcYlV0iwTpWW5rSEqOcpiYTefwvx2SQUBPYTSw/NixVq3dJDNmuMdxn4APt1o804
19+PpFYp/vMFB1zJEhYx6QhoQAQfkeUKsUHVaKPUiPeViYMikzcrWY5wPgf68tU=
=YHuG
-----END PGP SIGNATURE-----

```

<!-- END SIGNATURES -->

### Begin signed statement 

#### Expect

```
size   exec  file               contents                                                        
             ./                                                                                 
13             .gitignore       16d30e4462189fb14dd611bdb708c510630c576a1f35b9383e89a4352da36c97
93             .jshintrc        ac72baaccc327aca1aa7b22eb98d0eec7b15a69cfc2fe5a568c6f086ba8e2197
21             .npmignore       db7c7703dda761d8eae3d95eb9e06747089ece470e853d11fa942136371e8e8f
               lib/                                                                             
1974             graph.js       06cbf5526061652ffb995188b50eb0c07b9da40969bf4d4ed03c493eff6eef23
272              isiterable.js  b08a75c62c2c034c2307dd28af6957a55794e817096543767967c3ce19a78b48
7797             reasoner.js    d622e80bee349edfba4d4f5ee1f9ddec5d11f3cbfc2e992b2e82f471d9999d0e
637              reduce.js      51a6367fd9813a55e8b92a1829c41f2c37bb24f2745a5ccb9ca9b1d0d4ec25a8
2370             xsd-graph.js   2813ea9b8b817141a494d19fe90296469b95c345a8b29dd1d11f4907f23884c4
11381          LICENSE          2bcf83b42c65720625611f1fb2922bc9e3face6a22117331a13c9ed9f3af2903
664            package.json     5983ec2cfe2cfeeed19cd5d5aa14951d215715b421278c18debbdef98d9c7d83
6535           README.md        05cd3f076e2c8f3820766dcde1ad9d75c2528ab5bf1eb98980c304373d2e3554
               test/                                                                            
6720             test.js        f3cb03770805005372e8c718d3eb87da2455be7fc04fc497d681248399c6b245
100              test.ttl       f8565fdf03792ac477fe70a38f11088b1cfefa4b4efa011d3747a65d539219c7
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