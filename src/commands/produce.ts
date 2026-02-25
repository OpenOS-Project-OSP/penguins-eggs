/**
 * ./src/commands/produce.ts
 * penguins-eggs v.10.0.0 / ecmascript 2020
 * author: Piero Proietti
 * email: piero.proietti@gmail.com
 * license: MIT
 */

import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'
import fs from 'node:fs'
import path from 'node:path'

import Compressors from '../classes/compressors.js'
import Ovary from '../classes/ovary.js'
import Utils from '../classes/utils.js'
import { IAddons, IExcludes } from '../interfaces/index.js'
import Config from './config.js'

// _dirname
const __dirname = path.dirname(new URL(import.meta.url).pathname)

export default class Produce extends Command {
  static description = 'produce a live image from your system whithout your data'

  static examples = [
    'sudo eggs produce                    # zstd fast compression',
    'sudo eggs produce --standard         # xz compression',
    'sudo eggs produce --max              # xz max compression',
    'sudo eggs produce --pendrive         # zstd compression optimized pendrive',
    'sudo eggs produce --clone            # clone',
    'sudo eggs produce --cryptedclone     # crypted clone',
    'sudo eggs produce --basename=colibri',
    'sudo eggs produce --theme lastos',
    'sudo eggs produce --excludes static  # you can customize it',
    'sudo eggs produce --excludes homes   # exclude /home/*',
    'sudo eggs produce --excludes home    # exclude ~/*',
    'sudo eggs produce --recovery         # add recovery tools',
    'sudo eggs produce --recovery --recovery-gui=minimal  # with GUI',
    'sudo eggs produce --recovery --recovery-rescapp      # with rescapp'
  ]

  static flags = {
    addons: Flags.string({ description: 'addons to be used: adapt, pve, rsupport', multiple: true }),
    basename: Flags.string({ description: 'basename' }),
    clone: Flags.boolean({ char: 'c', description: 'clone' }),
    cryptedclone: Flags.boolean({ char: 'C', description: 'crypted clone' }),
    excludes: Flags.string({ description: 'use: static, homes, home', multiple: true }),
    help: Flags.help({ char: 'h' }),
    links: Flags.string({ description: 'desktop links', multiple: true }),
    max: Flags.boolean({ char: 'm', description: 'max compression: xz -Xbcj ...' }),
    noicon: Flags.boolean({ char: 'N', description: 'no icon eggs on desktop' }),
    nointeractive: Flags.boolean({ char: 'n', description: 'no user interaction' }),
    pendrive: Flags.boolean({ char: 'p', description: 'optimized for pendrive: zstd -b 1M -Xcompression-level 15' }),
    prefix: Flags.string({ char: 'P', description: 'prefix' }),
    recovery: Flags.boolean({ description: 'layer penguins-recovery tools onto the produced ISO' }),
    'recovery-gui': Flags.string({ description: 'GUI profile for recovery: minimal, touch, or full', options: ['minimal', 'touch', 'full'] }),
    'recovery-rescapp': Flags.boolean({ description: 'include rescapp GUI wizard in recovery ISO' }),
    release: Flags.boolean({ description: 'release: remove penguins-eggs, calamares and dependencies after installation' }),
    script: Flags.boolean({ char: 's', description: 'script mode. Generate scripts to manage iso build' }),
    standard: Flags.boolean({ char: 'S', description: 'standard compression: xz -b 1M' }),
    theme: Flags.string({ description: 'theme for livecd, calamares branding and partitions' }),
    unsecure: Flags.boolean({ char: 'u', description: '/root contents are included on live' }),
    verbose: Flags.boolean({ char: 'v', description: 'verbose' }),
    yolk: Flags.boolean({ char: 'y', description: 'force yolk renew' })
  }

  /**
   * Apply penguins-recovery tools to a produced ISO.
   * Downloads the adapter if not present, then runs it against the ISO.
   */
  private async applyRecovery(isoPath: string, guiProfile?: string, withRescapp?: boolean, verbose?: boolean): Promise<void> {
    const recoveryRepo = 'https://github.com/Interested-Deving-1896/penguins-recovery'
    const recoveryDir = '/usr/local/share/penguins-recovery'
    const adapterScript = `${recoveryDir}/adapters/adapter.sh`

    Utils.warning('Applying penguins-recovery tools to ISO...')

    // Clone or update penguins-recovery if not present
    if (!fs.existsSync(adapterScript)) {
      Utils.warning(`Downloading penguins-recovery from ${recoveryRepo}`)
      const { execSync } = await import('node:child_process')
      try {
        execSync(`git clone --depth=1 ${recoveryRepo} ${recoveryDir}`, {
          stdio: verbose ? 'inherit' : 'pipe'
        })
      } catch {
        console.log(chalk.red('Failed to download penguins-recovery. Skipping recovery layer.'))
        console.log(chalk.yellow(`Install manually: git clone ${recoveryRepo} ${recoveryDir}`))
        return
      }
    }

    // Build adapter command
    const outputIso = isoPath.replace('.iso', '-recovery.iso')
    let cmd = `sudo ${adapterScript} --input "${isoPath}" --output "${outputIso}"`

    if (guiProfile) {
      cmd += ` --gui ${guiProfile}`
    }

    if (withRescapp) {
      cmd += ' --with-rescapp'
    }

    Utils.warning(`Running: ${cmd}`)
    const { execSync } = await import('node:child_process')
    try {
      execSync(cmd, { stdio: 'inherit' })
      console.log(chalk.green(`Recovery ISO created: ${outputIso}`))
    } catch {
      console.log(chalk.red('penguins-recovery adapter failed. Original ISO is unchanged.'))
      console.log(chalk.yellow(`You can run manually: ${cmd}`))
    }
  }

  async run(): Promise<void> {
    Utils.titles(this.id + ' ' + this.argv)

    const { flags } = await this.parse(Produce)
    const pendrive = flags.pendrive === undefined ? null : Number(flags.pendrive)

    if (Utils.isRoot()) {
      /**
       * ADDONS dei vendors
       * Fino a 3
       */
      const addons = []
      if (flags.addons) {
        const { addons } = flags // array
        for (let addon of addons) {
          // se non viene specificato il vendor il default è eggs
          if (!addon.includes('//')) {
            addon = 'eggs/' + addon
          }

          const dirAddon = path.resolve(__dirname, `../../addons/${addon}`)
          if (!fs.existsSync(dirAddon)) {
            console.log(dirAddon)
            Utils.warning('addon: ' + chalk.white(addon) + ' not found, terminate!')
            process.exit()
          }

          const vendorAddon = addon.slice(0, Math.max(0, addon.search('/')))
          const nameAddon = addon.substring(addon.search('/') + 1, addon.length)
          if (nameAddon === 'theme') {
            flags.theme = vendorAddon
          }
        }
      }

      // links check
      const myLinks: string[] = []
      if (flags.links) {
        const { links } = flags
        for (const link_ of links) {
          if (fs.existsSync(`/usr/share/applications/${link_}.desktop`)) {
            myLinks.push(link_)
          } else {
            Utils.warning('desktop link: ' + chalk.white('/usr/share/applications/' + link_ + '.desktop') + ' not found!')
          }
        }
      }

      /**
       * composizione dei flag
       */

      // excludes
      const excludes = {} as IExcludes
      excludes.usr = true
      excludes.var = true
      excludes.static = false
      excludes.homes = false
      excludes.home = false

      if (flags.excludes) {
        if (flags.excludes.includes('static')) {
          excludes.static = true
        }

        if (flags.excludes.includes('homes')) {
          excludes.homes = true
        }

        if (flags.excludes.includes('home')) {
          excludes.home = true
        }
      }

      let prefix = ''
      if (flags.prefix !== undefined) {
        prefix = flags.prefix
      }

      let basename = '' // se vuoto viene definito da loadsetting (default nome dell'host)
      if (flags.basename !== undefined) {
        basename = flags.basename
      }

      const compressors = new Compressors()
      await compressors.populate()

      let compression = compressors.fast()
      if (flags.max) {
        compression = compressors.max()
      } else if (flags.pendrive) {
        compression = compressors.pendrive('15')
      } else if (flags.standard) {
        compression = compressors.standard()
      }

      const { release } = flags

      const { cryptedclone } = flags

      const { clone } = flags

      const { verbose } = flags

      const scriptOnly = flags.script

      const yolkRenew = flags.yolk

      const { nointeractive } = flags

      const { noicon } = flags

      // if clone or cryptedclone unsecure = true
      const unsecure = flags.unsecure || clone || cryptedclone

      /**
       * theme: if not defined will use eggs
       */
      let theme = 'eggs'
      if (flags.theme !== undefined) {
        theme = flags.theme
        if (theme.includes('/')) {
          if (theme.endsWith('/')) {
            theme = theme.slice(0, Math.max(0, theme.length - 1))
          }
        } else {
          const wpath = `/home/${await Utils.getPrimaryUser()}/.wardrobe/vendors/`
          theme = wpath + flags.theme
        }

        theme = path.resolve(theme)
        if (!fs.existsSync(theme + '/theme')) {
          console.log('Cannot find theme: ' + theme)
          process.exit()
        }
      }

      const i = await Config.thatWeNeed(nointeractive, verbose, cryptedclone)
      if ((i.needUpdate || i.configurationInstall || i.configurationRefresh || i.distroTemplate)) {
        await Config.install(i, nointeractive, verbose)
      }

      const myAddons = {} as IAddons
      if (flags.addons != undefined) {
        if (flags.addons.includes('adapt')) {
          myAddons.adapt = true
        }

        if (flags.addons.includes('pve')) {
          myAddons.pve = true
        }

        if (flags.addons.includes('rsupport')) {
          myAddons.rsupport = true
        }
      }

      Utils.titles(this.id + ' ' + this.argv)
      const ovary = new Ovary()
      Utils.warning('Produce an egg...')
      if (i.calamares) {
        let message="this is a GUI system, calamares is available, but NOT installed\n"
        Utils.warning(message)
      }

      if (await ovary.fertilization(prefix, basename, theme, compression, !nointeractive)) {
        await ovary.produce(clone, cryptedclone, scriptOnly, yolkRenew, release, myAddons, myLinks, excludes, nointeractive, noicon, unsecure, verbose)
        ovary.finished(scriptOnly)

        // Post-produce: layer penguins-recovery tools onto the ISO
        if (flags.recovery && !scriptOnly) {
          await this.applyRecovery(
            ovary.settings.config.snapshot_dir + ovary.settings.isoFilename,
            flags['recovery-gui'],
            flags['recovery-rescapp'],
            verbose
          )
        }
      }
    } else {
      Utils.useRoot(this.id)
    }
  }
}
