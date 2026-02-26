/**
 * ./src/commands/export/appimage.ts
 * penguins-eggs-legacy v.25.7.x / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

import { Command, Flags } from '@oclif/core'
import fs from 'node:fs'
import os from 'node:os'

import Distro from '../../classes/distro.js'
import Diversions from '../../classes/diversions.js'
import Tools from '../../classes/tools.js'
import Utils from '../../classes/utils.js'
import { IEggsConfigTools } from '../../interfaces/i-config-tools.js'
import { exec, execSync } from '../../lib/utils.js'

export default class ExportPkg extends Command {
  static description = 'export penguins-eggs-legacy package to the destination host'
  static examples = ['eggs export pkg', 'eggs export pkg --clean', 'eggs export pkg --all']
  static flags = {
    all: Flags.boolean({ char: 'a', description: 'export all archs' }),
    clean: Flags.boolean({ char: 'c', description: 'remove old .deb before to copy' }),
    help: Flags.help({ char: 'h' }),
    verbose: Flags.boolean({ char: 'v', description: 'verbose' })
  }
  all = false
  clean = false
  echo = {}
  Tu = new Tools()
  user = ''
  verbose = false

  /**
   *
   */
  async run(): Promise<void> {
    const { args, flags } = await this.parse(ExportPkg)
    Utils.titles(this.id + ' ' + this.argv)
    Utils.warning(ExportPkg.description)

    // Ora servono in più parti
    this.user = os.userInfo().username
    if (this.user === 'root') {
      this.user = (execSync('echo $DOAS_USER') || '').trim()
      if (this.user === '') {
        this.user = (execSync('echo $DOAS_USER') || '').trim()
      }
    }

    this.all = flags.all
    this.clean = flags.clean
    this.verbose = flags.verbose
    this.echo = Utils.setEcho(this.verbose)
    await this.Tu.loadSettings()

    const distro = new Distro()
    const { familyId } = distro
    const { distroId } = distro

    let localPath = ''
    let remotePath = ''
    let filter = ''
    let regex: RegExp | undefined = undefined
    let cleanFilter = ''

    switch (familyId) {
      case 'alpine': {
        let arch = 'x86_64'
        if (process.arch === 'ia32') {
          arch = 'i386'
        }

        Utils.warning(`exporting Alpine APK packages`)
        localPath = `/home/${this.user}/packages/aports/${arch}`
        remotePath = `${this.Tu.config.remotePathPackages}/alpine/${arch}`
        filter = `penguins-eggs-legacy-+([0-9.])-*.apk`
        regex = /^penguins-eggs-legacy-([0-9.]+)-.*\.apk$/
        cleanFilter = 'penguins-eggs-legacy*.apk'
        break
      }

      /**
       * Arch/Manjaro
       */
      case 'archlinux': {
        /**
         * Arch/Manjaro: Manjaro
         */
        if (Diversions.isManjaroBased(distroId)) {
          Utils.warning(`exporting Manjaro .pkg.tar.zst packages`)
          localPath = `/home/${this.user}/penguins-packs/manjaro/penguins-eggs-legacy`
          remotePath = this.Tu.config.remotePathPackages + '/manjaro'
          filter = `penguins-eggs-legacy+([0-9.])-*-any.pkg.tar.*`
          regex = /^penguins-eggs-legacy-?([0-9.]+)-.*-any\.pkg\.tar\..*$/
          cleanFilter = 'penguins-eggs-legacy*.pkg.tar.*'
        } else {
          /**
           * Arch/Manjaro:Arch
           */
          Utils.warning(`exporting Arch .pkg.tar.zst packages`)
          localPath = `/home/${this.user}/penguins-packs/aur/penguins-eggs-legacy`
          remotePath = this.Tu.config.remotePathPackages + '/aur'
          filter = `penguins-eggs-legacy+([0-9.])-*-any.pkg.tar.zst`
          regex = /^penguins-eggs-legacy-?([0-9.]+)-.*-any\.pkg\.tar\.zst$/
          cleanFilter = 'penguins-eggs-legacy*.pkg.tar.zst'
        }

        break
      }

      /**
       * Debian
       */
      case 'debian': {
        Utils.warning(`exporting Devuan/Debian/Ubuntu DEB packages`)
        localPath = `/home/${this.user}/forge/penguins-eggs-legacy/releases`
        remotePath = this.Tu.config.remotePathPackages + '/debs'
        let arch = Utils.uefiArch()
        if (this.all) {
          arch = '*'
        }

        filter = `penguins-eggs-legacy_+([0-9.])-?_${arch}.deb`
        const archPattern = arch === '*' ? '.*' : arch
        regex = new RegExp('^penguins-eggs-legacy_([a-zA-Z0-9.~+-]+)_' + archPattern + '\\.deb$')
        cleanFilter = `penguins-eggs-legacy*_${arch}.deb`
        break
      }

      case 'fedora': {
        /**
         * fedora
         */
        let repo = 'fedora'
        let ftype = 'fc??'
        let warning = `exporting Fedora RPM packages`
        if (distro.distroId !== 'Fedora') {
          repo = 'el9'
          ftype = `el?`
          warning = `exporting Almalinux/RHEL/Rocky RPM packages`
        }

        Utils.warning(warning)
        localPath = `/home/${this.user}/rpmbuild/RPMS/x86_64`
        remotePath = this.Tu.config.remotePathPackages + `/` + repo
        filter = `penguins-eggs-legacy-+([0-9.])-*.${ftype}.x86_64.rpm`
        const ftypePattern = ftype.replace(/\?/g, '.')
        regex = new RegExp('^penguins-eggs-legacy-([0-9.]+)-.*\\.' + ftypePattern + '\\.x86_64\\.rpm$')
        cleanFilter = `penguins-eggs-legacy*.${ftype.replace(/\?/g, '*')}.x86_64.rpm`
        break
      }

      case 'openmamba': {
        /**
         * openmamba
         */
        Utils.warning(`exporting Openmamba RPM packages`)
        localPath = `/home/${this.user}/rpmbuild/RPMS/x86_64`
        remotePath = this.Tu.config.remotePathPackages + '/openmamba'
        filter = `penguins-eggs-legacy-+([0-9.])-*.mamba.*.rpm`
        regex = /^penguins-eggs-legacy-([0-9.]+)-.*\.mamba\..*\.rpm$/
        cleanFilter = 'penguins-eggs-legacy*.mamba.*.rpm'
        break
      }

      case 'opensuse': {
        /**
         * opensuse
         */
        Utils.warning(`exporting OpenSuSE RPM packages`)
        localPath = `/home/${this.user}/rpmbuild/RPMS/x86_64`
        remotePath = this.Tu.config.remotePathPackages + '/opensuse'
        filter = `penguins-eggs-legacy-+([0-9.])-*.rpm`
        regex = /^penguins-eggs-legacy-([0-9.]+)-.*\.rpm$/
        cleanFilter = 'penguins-eggs-legacy*.rpm'
        break
      }

      case 'chromiumos':
      case 'gentoo': {
        Utils.warning(`exporting Gentoo/ChromiumOS packages`)
        localPath = `/home/${this.user}/penguins-eggs-export`
        remotePath = this.Tu.config.remotePathPackages + '/gentoo'
        filter = `penguins-eggs-+([0-9.])*.tar.gz`
        break
      }
      // No default
    }

    const files: string[] = []
    if (fs.existsSync(localPath)) {
      const allFiles = fs.readdirSync(localPath)
      for (const file of allFiles) {
        if (regex && regex.test(file)) {
          files.push(`${localPath}/${file}`)
        }
      }
    }

    if (files.length === 0) {
      console.log(`No package files found in ${localPath}`)
      return
    }

    const remote = `${this.Tu.config.remoteUser}@${this.Tu.config.remoteHost}`
    let cmd = `#!/bin/bash\nset -e\n`
    let sshCmd = `mkdir -p ${remotePath}`
    if (this.clean) {
      let archDest = ''
      if (distro.familyId === 'alpine') {
        archDest = 'x86_64/'
        if (process.arch === 'ia32') {
          archDest = 'i386/'
        }
      }
      sshCmd += ` && rm -f ${remotePath}/${archDest}${cleanFilter}`
    }
    cmd += `ssh ${remote} "${sshCmd}"\n`
    cmd += `scp ${files.join(' ')} ${remote}:${remotePath}\n`

    if (!this.verbose) {
      if (this.clean) {
        console.log(`remove: ${remote}:${remotePath}/${cleanFilter}`)
      }

      console.log(`copy: ${files.join(', ')} to ${remote}:${remotePath}`)
    }

    await exec(cmd, this.echo)
  }
}
